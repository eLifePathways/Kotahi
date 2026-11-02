import {
  describe,
  beforeAll,
  beforeEach,
  afterEach,
  afterAll,
  it,
  expect,
  vi,
} from 'vitest'
import { Readable } from 'stream'
import gql from 'graphql-tag'
import { createRequire } from 'module'
import { type ExecutionResult, type GraphQLSchema } from 'graphql'
import {
  createGraphqlTestServer,
  migrationManager,
  db,
  config,
  DbTestUtils,
  fileStorage,
  subscriptionManager,
} from '@coko/server'
import generateSchema from '@coko/server/dist/graphql/generateSchema'
// @ts-ignore
import Upload from 'graphql-upload/Upload.mjs'

import { Group, User, Manuscript, Team, Config } from '../../../../models'

// coko builds the schema with the CommonJS build of graphql, while vitest would
// import the ESM build, so subscribe is required to get the same instance
const { subscribe } = createRequire(__filename)('graphql')

const CONVERSION_PATH = '/api/v1/sync/DOCXToHTML'

const conversion = { html: '<h1>Title</h1><p>Body</p>', fails: false }

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })

// The resolvers are loaded by coko outside vitest's module graph, so module
// mocks don't reach them. XSweet is stubbed at the fetch level instead.
const fetchMock = vi.fn<typeof fetch>(async url => {
  const { pathname } = new URL(String(url))

  if (pathname === '/healthcheck')
    return jsonResponse(200, { message: 'Coolio' })
  if (pathname === '/api/auth')
    return jsonResponse(200, { accessToken: 'token' })

  if (pathname === CONVERSION_PATH) {
    return conversion.fails
      ? jsonResponse(500, { message: 'XSweet is down' })
      : jsonResponse(200, { html: conversion.html })
  }

  throw new Error(`Unexpected request to ${url}`)
})

const convertedFiles = (): File[] =>
  fetchMock.mock.calls
    .filter(([url]) => new URL(String(url)).pathname === CONVERSION_PATH)
    .map(([, init]) => (init?.body as FormData).get('docx') as File)

const CREATE_SUBMISSION = gql`
  mutation CreateSubmission($groupId: ID!, $file: Upload, $operationId: ID) {
    createSubmission(
      groupId: $groupId
      file: $file
      operationId: $operationId
    ) {
      id
    }
  }
`

const NEW_SUBMISSION_SETTINGS = gql`
  query NewSubmissionSettings {
    newSubmissionSettings {
      maxUploadSizeMb
      acceptedFileTypes
    }
  }
`

const NEW_SUBMISSION_PROGRESS = gql`
  subscription NewSubmissionProgress($operationId: ID!) {
    newSubmissionProgress(operationId: $operationId)
  }
`

const MB = 1024 * 1024

type GraphqlResult = {
  data?: Record<string, any> | null
  errors?: readonly { message: string; extensions?: Record<string, unknown> }[]
}

const upload = (
  filename: string,
  chunks: Iterable<Buffer> = [Buffer.from('file content')],
): unknown => {
  const file = new Upload()

  file.resolve({
    filename,
    mimetype: 'application/octet-stream',
    encoding: '7bit',
    createReadStream: () => Readable.from(chunks),
  })

  return file
}

function* oversized(sizeMb: number): Generator<Buffer> {
  const chunk = Buffer.alloc(MB)
  for (let i = 0; i < sizeMb; i += 1) yield chunk
}

const run = async (
  query: ReturnType<typeof gql>,
  variables: Record<string, unknown>,
  userId?: string,
): Promise<GraphqlResult> => {
  const server = await createGraphqlTestServer()

  const result = await server.executeOperation(
    { query, variables },
    { contextValue: { userId, req: { headers: {} } } },
  )

  if (result.body.kind !== 'single') {
    throw new Error('Expected single result, got incremental')
  }

  return result.body.singleResult as GraphqlResult
}

const createSubmission = (
  userId: string | undefined,
  groupId: string,
  options: { file?: unknown; operationId?: string } = {},
): Promise<GraphqlResult> =>
  run(CREATE_SUBMISSION, { groupId, ...options }, userId)

const isDenied = (result: GraphqlResult): boolean =>
  !!result.errors?.some(error => error.message === 'Not Authorised!')

const errorCode = (result: GraphqlResult): unknown =>
  result.errors?.[0]?.extensions?.code

const addToGroupTeam = async (
  userId: string,
  groupId: string,
  role: string,
  displayName: string,
): Promise<void> => {
  const team = await Team.insert({
    objectId: groupId,
    objectType: 'group',
    role,
    displayName,
  })

  await Team.addMember(team.id, userId)
}

const makeAdmin = async (userId: string): Promise<void> => {
  const team = await Team.insert({
    role: 'admin',
    displayName: 'Admin',
    global: true,
  })

  await Team.addMember(team.id, userId)
}

const setSubmitOptions = (
  groupId: string,
  submitOptions?: string,
): Promise<Config> =>
  Config.insert({
    groupId,
    active: true,
    formData: {
      submission: { submissionPage: submitOptions ? { submitOptions } : {} },
    },
  })

describe('new submission API', () => {
  let schema: GraphQLSchema

  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
    fileStorage.init()
    subscriptionManager.init()
    schema = await generateSchema()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
    conversion.fails = false
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    fetchMock.mockClear()
    vi.unstubAllGlobals()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  const groupWithMember = async (
    submitOptions?: string,
  ): Promise<{ groupId: string; userId: string }> => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await setSubmitOptions(group.id, submitOptions)
    await addToGroupTeam(user.id, group.id, 'user', 'User')

    return { groupId: group.id, userId: user.id }
  }

  describe('createSubmission permissions', () => {
    it('rejects requests that are not logged in', async () => {
      const { groupId } = await groupWithMember()

      const result = await createSubmission(undefined, groupId)

      expect(isDenied(result)).toBe(true)
      expect((await Manuscript.find({})).totalCount).toBe(0)
    })

    it('rejects users who are not in the group', async () => {
      const { groupId } = await groupWithMember()
      const outsider = await User.insert({})

      const result = await createSubmission(outsider.id, groupId)

      expect(isDenied(result)).toBe(true)
      expect((await Manuscript.find({})).totalCount).toBe(0)
    })

    it('rejects members of a different group', async () => {
      const { groupId } = await groupWithMember()
      const { userId: otherGroupMember } = await groupWithMember()

      const result = await createSubmission(otherGroupMember, groupId)

      expect(isDenied(result)).toBe(true)
    })

    it('lets group members submit', async () => {
      const { groupId, userId } = await groupWithMember()

      const result = await createSubmission(userId, groupId)

      expect(result.errors).toBeUndefined()
      expect(result.data?.createSubmission.id).toBeDefined()
    })

    it.each([
      ['group managers', 'groupManager', 'Group Manager'],
      ['group admins', 'groupAdmin', 'Group Admin'],
    ])(
      'lets %s submit without being group members',
      async (_, role, displayName) => {
        const group = await Group.insert({})
        const user = await User.insert({})
        await setSubmitOptions(group.id)
        await addToGroupTeam(user.id, group.id, role, displayName)

        const result = await createSubmission(user.id, group.id)

        expect(result.errors).toBeUndefined()
      },
    )

    it('lets admins submit without being group members', async () => {
      const group = await Group.insert({})
      const user = await User.insert({})
      await setSubmitOptions(group.id)
      await makeAdmin(user.id)

      const result = await createSubmission(user.id, group.id)

      expect(result.errors).toBeUndefined()
    })

    describe("the group's submission options", () => {
      it.each([
        [undefined, true],
        ['allowAuthorUploadOnly', true],
        ['allowAuthorUploadWithForm', true],
        ['allowAuthorSubmitForm', false],
        ['allowAuthorSubmitFormWithBlankEditor', false],
      ])(
        'with submitOptions %s, uploading a file is allowed: %s',
        async (submitOptions, allowed) => {
          const { groupId, userId } = await groupWithMember(submitOptions)

          const result = await createSubmission(userId, groupId, {
            file: upload('paper.docx'),
          })

          expect(isDenied(result)).toBe(!allowed)
        },
      )

      it.each([
        [undefined, true],
        ['allowAuthorUploadOnly', false],
        ['allowAuthorUploadWithForm', true],
        ['allowAuthorSubmitForm', true],
        ['allowAuthorSubmitFormWithBlankEditor', true],
      ])(
        'with submitOptions %s, starting without a file is allowed: %s',
        async (submitOptions, allowed) => {
          const { groupId, userId } = await groupWithMember(submitOptions)

          const result = await createSubmission(userId, groupId)

          expect(isDenied(result)).toBe(!allowed)
        },
      )

      it('applies to admins too', async () => {
        const group = await Group.insert({})
        const user = await User.insert({})
        await setSubmitOptions(group.id, 'allowAuthorUploadOnly')
        await makeAdmin(user.id)

        const result = await createSubmission(user.id, group.id)

        expect(isDenied(result)).toBe(true)
      })
    })
  })

  describe('createSubmission results', () => {
    it('creates the manuscript and returns it', async () => {
      const { groupId, userId } = await groupWithMember()

      const result = await createSubmission(userId, groupId, {
        file: upload('paper.docx'),
      })

      expect(result.errors).toBeUndefined()

      const manuscript = await Manuscript.findById(
        result.data?.createSubmission.id,
      )

      expect(manuscript.submitterId).toBe(userId)
      expect(manuscript.groupId).toBe(groupId)
      expect(manuscript.meta.source).toContain('<p>Body</p>')
    })

    it('sends the uploaded file to the conversion', async () => {
      const { groupId, userId } = await groupWithMember()

      await createSubmission(userId, groupId, {
        file: upload('paper.docx', [Buffer.from('docx bytes')]),
      })

      const [file] = convertedFiles()

      expect(file.name).toBe('file.docx')
      expect(await file.text()).toBe('docx bytes')
    })
  })

  describe('createSubmission errors', () => {
    it.each([
      ['UNSUPPORTED_FILE_TYPE', 'paper.exe', false],
      ['CONVERSION_FAILED', 'paper.docx', true],
    ])('returns the %s error code', async (code, filename, conversionFails) => {
      const { groupId, userId } = await groupWithMember()
      conversion.fails = conversionFails

      const result = await createSubmission(userId, groupId, {
        file: upload(filename),
      })

      expect(errorCode(result)).toBe(code)
      expect((await Manuscript.find({})).totalCount).toBe(0)
    })

    it('returns FILE_TOO_LARGE for files over the size limit', async () => {
      const { groupId, userId } = await groupWithMember()
      const maxSizeMb = config.get('manuscripts.maxUploadSizeMb')

      const result = await createSubmission(userId, groupId, {
        file: upload('paper.docx', oversized(maxSizeMb + 1)),
      })

      expect(errorCode(result)).toBe('FILE_TOO_LARGE')
      expect(result.errors?.[0].message).toBe(
        `paper.docx is larger than ${maxSizeMb} MB`,
      )

      expect(convertedFiles()).toHaveLength(0)
      expect((await Manuscript.find({})).totalCount).toBe(0)
    })
  })

  describe('newSubmissionProgress', () => {
    const subscribeAs = async (
      userId: string | undefined,
      operationId: string,
    ): Promise<
      AsyncGenerator<ExecutionResult> | ExecutionResult<Record<string, unknown>>
    > =>
      subscribe({
        schema,
        document: NEW_SUBMISSION_PROGRESS,
        variableValues: { operationId },
        contextValue: { userId, req: { headers: {} } },
      }) as Promise<
        | AsyncGenerator<ExecutionResult>
        | ExecutionResult<Record<string, unknown>>
      >

    const nextOrTimeout = (
      iterator: AsyncGenerator<ExecutionResult>,
      ms: number,
    ): Promise<IteratorResult<ExecutionResult> | 'timeout'> =>
      Promise.race([
        iterator.next(),
        new Promise<'timeout'>(resolve => {
          setTimeout(() => resolve('timeout'), ms)
        }),
      ])

    it('sends the steps of the operation, in order, to the user who started it', async () => {
      const { groupId, userId } = await groupWithMember()
      const operationId = 'operation-1'

      const iterator = (await subscribeAs(
        userId,
        operationId,
      )) as AsyncGenerator<ExecutionResult>

      const steps: string[] = []

      const collecting = (async (): Promise<void> => {
        while (steps.length < 4) {
          // eslint-disable-next-line no-await-in-loop
          const { value } = await iterator.next()
          steps.push(value.data?.newSubmissionProgress as string)
        }
      })()

      await createSubmission(userId, groupId, {
        file: upload('paper.docx'),
        operationId,
      })

      await collecting
      await iterator.return(undefined)

      expect(steps).toEqual([
        'converting',
        'cleaning',
        'inferringMetadata',
        'creatingManuscript',
      ])
    })

    it("does not send another user's progress", async () => {
      const { groupId, userId } = await groupWithMember()
      const other = await User.insert({})
      const operationId = 'operation-2'

      const iterator = (await subscribeAs(
        other.id,
        operationId,
      )) as AsyncGenerator<ExecutionResult>

      await createSubmission(userId, groupId, {
        file: upload('paper.docx'),
        operationId,
      })

      expect(await nextOrTimeout(iterator, 500)).toBe('timeout')
      await iterator.return(undefined)
    })

    it('does not send the progress of other operations', async () => {
      const { groupId, userId } = await groupWithMember()

      const iterator = (await subscribeAs(
        userId,
        'operation-3',
      )) as AsyncGenerator<ExecutionResult>

      await createSubmission(userId, groupId, {
        file: upload('paper.docx'),
        operationId: 'operation-4',
      })

      expect(await nextOrTimeout(iterator, 500)).toBe('timeout')
      await iterator.return(undefined)
    })

    it('does not send progress to subscribers who are not logged in', async () => {
      const { groupId, userId } = await groupWithMember()
      const operationId = 'operation-5'

      const iterator = (await subscribeAs(
        undefined,
        operationId,
      )) as AsyncGenerator<ExecutionResult>

      await createSubmission(userId, groupId, {
        file: upload('paper.docx'),
        operationId,
      })

      expect(await nextOrTimeout(iterator, 500)).toBe('timeout')
      await iterator.return(undefined)
    })
  })

  describe('newSubmissionSettings', () => {
    it('returns the upload size limit and the accepted extensions', async () => {
      const user = await User.insert({})

      const result = await run(NEW_SUBMISSION_SETTINGS, {}, user.id)

      expect(result.data?.newSubmissionSettings).toEqual({
        maxUploadSizeMb: config.get('manuscripts.maxUploadSizeMb'),
        acceptedFileTypes: [
          '.docx',
          '.tex',
          '.latex',
          '.txt',
          '.dvi',
          '.pdf',
          '.epub',
          '.zip',
        ],
      })
    })

    it('rejects requests that are not logged in', async () => {
      const result = await run(NEW_SUBMISSION_SETTINGS, {})

      expect(isDenied(result)).toBe(true)
    })
  })
})
