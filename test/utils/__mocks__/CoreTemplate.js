const mockAddModule = jest.fn()
const mockAddLocalModule = jest.fn()
const mockAddUseRoute = jest.fn()
const mockAddAppUse = jest.fn()

const mock = jest.mock('../../../utils/CoreTemplate', function () {
  return jest.fn().mockImplementation(
    function (name) {
      this.locals = {
        name: name,
        localModules: {},
        modules: {},
        mounts: [],
        uses: [],
        db: false,
        cache: false
      }
      this.addModule = mockAddModule
      this.addLocalModule = mockAddLocalModule
      this.addUseRoute = mockAddUseRoute
      this.addAppUse = mockAddAppUse
    }
  )
})

module.exports = {
  default: mock,
  mockAddModule,
  mockAddLocalModule,
  mockAddUseRoute,
  mockAddAppUse
}
