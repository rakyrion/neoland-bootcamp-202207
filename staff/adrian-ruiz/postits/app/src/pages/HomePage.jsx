import { useState, useEffect, useRef } from 'react'
import NewNotePopUp from '../components/NewNotePopUp'
import Header from '../components/Header'
import ListPanel from '../components/ListPanel'
import ProfileMenu from '../components/ProfileMenu'
import retrieveUser from '../logic/retrieveUser'
import retrieveNotes from '../logic/retrieveNotes'
import updateNote from '../logic/updateNote'
import deleteNote from '../logic/deleteNote'
import createNote from '../logic/createNote'
import withContext from '../utils/withContext'
import Loggito from '../utils/loggito'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'


function HomePage({ onLogout, context: { handleFeedback } }) {
    const navigate = useNavigate()
    const location = useLocation()
 
    const [name, setName] = useState('null')
    const [notes, setNotes] = useState(null)
    const [popUp, setPopUp] = useState(null)

    const myComponentRef = useRef()

    const logger = new Loggito('HomePage')

    useEffect(() => {
        logger.info('"componentDidMount"')

        try {
            retrieveUser(sessionStorage.UserToken, (error, user) => {
                if (error) {
                    handleFeedback({ level: "error", message: error.message })
                    logger.warn(error.message)
                    return
                }

                setName(user.name)

                logger.debug('setName', user.name)
            })

        } catch (error) {
            handleFeedback({ level: "error", message: error.message })
            logger.warn(error.message)
        }

        loadNotes()
    }, []);


    const loadNotes = () => {

        try {
            retrieveNotes(sessionStorage.UserToken, (error, notes) => {
                if (error) {
                    handleFeedback({ level: "error", message: error.message })
                    logger.warn(error.message)

                    return
                }

                setNotes(notes)


                logger.debug('setNotes', notes)
            })
        } catch (error) {
            handleFeedback({ level: "error", message: error.message })
            logger.warn(error.message)
        }
    }

    const handleChangeColorNote = (notes) => {

        setNotes(notes)
        logger.debug('setNotes', notes)
    }

    const handleUpdateNote = (noteId, title, text) => {
        try {
            updateNote(sessionStorage.UserToken, noteId, title, text, error => {
                if (error) {
                    handleFeedback({ level: "error", message: error.message })
                    logger.warn(error.message)

                    return
                }
            })
        } catch (error) {
            handleFeedback({ level: "error", message: error.message })
            logger.warn(error.message)
        }
    }

    const handleDeleteNote = (noteId) => {
        let result = window.confirm('Are you sure to delete that note?')
        if (result) {
            try {
                deleteNote(sessionStorage.UserToken, noteId, error => {
                    if (error) {
                        handleFeedback({ level: "error", message: error.message })
                        logger.warn(error.message)

                        return
                    }
                    handleFeedback({ level: "success", message: 'Note deleted successfully' })
                    loadNotes()

                })
            } catch (error) {
                handleFeedback({ level: "error", message: error.message })
                logger.warn(error.message)
            }
        }
    }

    const handleLogout = () => {
        const result = window.confirm('Are you sure to Log Out?')
        if (result)
            onLogout()
        else return
    }

    const handleAddClick = () => {
        setPopUp('newNote')

        logger.debug('setPopUp', 'newNote')
    }

    const handleSubmitNewNote = (title, text) => {
        try {
            createNote(sessionStorage.UserToken, title, text, (error) => {
                if (error) {
                    handleFeedback({ level: "error", message: error.message })
                    logger.warn(error.message)

                    return
                }

                setPopUp(null)

                logger.debug('setPopUp', null)

                loadNotes()

            })
        } catch (error) {
            handleFeedback({ level: "error", message: error.message })
            logger.warn(error.message)
        }
    }

    const handleCancelNewNote = () => {
        let result = window.confirm('Are you sure to cancel note creation?')

        if (result) {
            setPopUp(null)
            logger.debug('setPopUp', null)
        } else return
    }

    const handleProfileClick = () => {
        if (location.pathname !== 'profile') {
            navigate('profile')
            logger.debug('navigate -> profile')
        }
    }

    const handleHomeClick = () => {
        if (location.pathname !== '/') {
            navigate('/')
            logger.debug('navigate -> list')
        }

        if (myComponentRef.current) {
            // handleScroll is a method from my Child (List panel) which I invoke by ref
            myComponentRef.current.handleScroll()
        }
    }

    if (name)
        return (
            <>
                {popUp === 'newNote' &&
                    <NewNotePopUp onNewNoteSubmit={handleSubmitNewNote} onCancelNewNote={handleCancelNewNote} />
                }
                <main className="page homePage">
                    <Header name={name} onLogout={handleLogout} onProfileClick={handleProfileClick} onHomeClick={handleHomeClick} />
                    <Routes>
                        <Route path='/' element={<ListPanel notes={notes} onUpdateNote={handleUpdateNote} onDeleteNote={handleDeleteNote} onChangeColorNote={handleChangeColorNote} ref={myComponentRef} />} />
                        <Route path='/profile' element={<ProfileMenu />} />
                    </Routes>

                    <section className="bottomMenu">
                        {location.pathname === '/' && <button className="newNoteButton"><span className="newNoteEmoji" onClick={handleAddClick}>📝</span></button>
                        }

                    </section>
                </main>
            </>
        )
}

export default withContext(HomePage)