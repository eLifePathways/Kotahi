class Binding {
  constructor(registry) {
    this.registry = registry
    this.shared = false
    this.create = null
    this.hasValue = false
    this.value = undefined
  }

  to(Class) {
    this.create = () => this.registry.construct(Class)
    return this
  }

  toDynamicValue(createValue) {
    this.create = () => createValue(this.registry.context)
    return this
  }

  toFactory(createValue) {
    this.create = () => createValue(this.registry.context)
    this.shared = true
    return this
  }

  toConstantValue(value) {
    this.create = () => value
    this.shared = true
    return this
  }

  inSingletonScope() {
    this.shared = true
    return this
  }

  resolve() {
    if (!this.shared) return this.create()

    if (!this.hasValue) {
      this.value = this.create()
      this.hasValue = true
    }

    return this.value
  }
}

export default class Registry {
  constructor() {
    this.bindings = new Map()
    this.context = { container: this }
  }

  bind(name) {
    const binding = new Binding(this)
    if (!this.bindings.has(name)) this.bindings.set(name, [])
    this.bindings.get(name).push(binding)
    return binding
  }

  get(name) {
    const bindings = this.bindings.get(name)

    if (!bindings)
      throw new Error(
        `No matching bindings found for serviceIdentifier: ${name}`,
      )

    if (bindings.length > 1)
      throw new Error(`Ambiguous match found for serviceIdentifier: ${name}`)

    return bindings[0].resolve()
  }

  getAll(name) {
    const bindings = this.bindings.get(name)

    if (!bindings)
      throw new Error(
        `No matching bindings found for serviceIdentifier: ${name}`,
      )

    return bindings.map(binding => binding.resolve())
  }

  isBound(name) {
    return this.bindings.has(name)
  }

  ids() {
    return [...this.bindings.keys()]
  }

  count(name) {
    return this.bindings.get(name)?.length ?? 0
  }

  construct(Class) {
    const dependencies = (Class.inject || []).map(dependency =>
      typeof dependency === 'string'
        ? this.get(dependency)
        : this.getAll(dependency.all),
    )

    return new Class(...dependencies)
  }
}
