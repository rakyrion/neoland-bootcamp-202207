const { NotFoundError } = require('errors')
const { User, Note } = require('../models')
const deleteNote = require('./deleteNote')
const { connect, disconnect, Types: { ObjectId } } = require('mongoose')
const chai = require('chai')
const chaiaspromise = require('chai-as-promised')
const expect = chai.expect
chai.use(chaiaspromise)

describe('deleteNote', () => {

    before(() => connect('mongodb://localhost:27017/postits-test'))

    beforeEach(() => Promise.all([User.deleteMany(), Note.deleteMany()]))

    it('Succeeds deleting an existing user', () => {
        const name = 'SpecTesting'
        const email = 'spec@testing.com'
        const password = '123123123Aa!'
        const title = 'Spec Title';

        return (async () => {
            await User.create({ name, email, password })

            const user = await User.findOne({ 'email': email })

            const note = await Note.create({ user: user.id, title })

            await deleteNote(user.id, note.id)

            const notes = await Note.find()

            expect(notes).to.have.lengthOf(0)

        })()
    }),

        it('Fails trying to delete with unexisting noteId but existing user with one note', () => {

            const name = 'SpecTesting'
            const email = 'spec@testing.com'
            const password = '123123123Aa!'
            const title = 'Spec Title'
            const badId = new ObjectId().toString();

            return (async () => {
                await User.create({ name, email, password })

                const user = await User.findOne({ 'email': email })

                const note = await Note.create({ user: user.id, title })

                await expect(deleteNote(user.id, badId)).to.eventually.be.rejectedWith(`Note with id ${badId} not found`)
                    .and.be.an.instanceOf(NotFoundError)

                const notes = await Note.find()

                expect(notes).to.have.lengthOf(1)
            })()

        }),

        it('Fails trying to delete note with unexisting userId', () => {
            const name = 'SpecTesting'
            const email = 'spec@testing.com'
            const password = '123123123Aa!'

            const title = 'Spec Title'
            const badId = new ObjectId().toString();

            return (async () => {
                const user = await User.create({ name, email, password })

                const note = await Note.create({ user: user.id, title })


                await expect(deleteNote(badId, note.id)).to.eventually.be.rejectedWith(`User with ID ${badId} not found`)
                    .and.be.an.instanceOf(NotFoundError)
            })()
        })

    it('Fails if noteId does not belong userId', () => {
        const name = 'SpecTesting'
        const email = 'spec@testing.com'
        const password = '123123123Aa!'

        const email2 = 'spec2@testing.com'
        const title = 'Spec Title';

            return (async () => {
                
                const user = await User.create({ name, email, password })

                const user2 = await User.create({ name, email: email2, password })

                const note = await Note.create({ user: user.id, title })

                await expect(deleteNote(user2.id, note.id)).to.eventually.be.rejected
            })()
    })

    after(() => disconnect())
})