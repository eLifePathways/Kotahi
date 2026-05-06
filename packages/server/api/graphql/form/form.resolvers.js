const { GraphQLScalarType, Kind } = require('graphql')

const {
  createForm,
  deleteForm,
  deleteFormElement,
  formForPurposeAndCategory,
  getFormById,
  getForms,
  getFormsByCategory,
  updateForm,
  updateFormElement,
} = require('../../../controllers/form.controllers')

const { encrypt } = require('../../../utils/encryptDecryptUtils')

const PasswordScalar = new GraphQLScalarType({
  name: 'Password',
  description: 'Password scalar type for encryption',

  // Encrypt the value when the input is received
  parseValue(value) {
    return encrypt(value)
  },

  serialize(value) {
    return value
  },

  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return this.parseValue(ast.value)
    }

    return null
  },
})

module.exports = {
  Password: PasswordScalar,
  Query: {
    form: async (_, { formId }) => {
      return getFormById(formId)
    },

    formForPurposeAndCategory: async (_, { purpose, category, groupId }) => {
      return formForPurposeAndCategory(purpose, category, groupId)
    },

    forms: async () => {
      return getForms()
    },

    formsByCategory: async (_, { category, groupId }) => {
      return getFormsByCategory(category, groupId)
    },

    /** Returns the specific requested form */
  },

  Mutation: {
    createForm: async (_, { form }) => {
      return createForm(form)
    },

    deleteForm: async (_, { formId }) => {
      return deleteForm(formId)
    },

    deleteFormElement: async (_, { formId, elementId }) => {
      return deleteFormElement(formId, elementId)
    },

    updateForm: async (_, { form }) => {
      return updateForm(form)
    },

    updateFormElement: async (_, { element, formId }) => {
      return updateFormElement(element, formId)
    },
  },
}
