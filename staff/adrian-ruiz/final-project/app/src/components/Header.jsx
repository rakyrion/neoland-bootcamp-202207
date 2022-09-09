import 'material-symbols'
import './Header.css'
import { useState } from 'react'
import withContext from '../utils/withContext'
import SettingsDropdown from './SettingsDropdown'

function Header() {

    const [settingsView, setSettingsView] = useState(false)

    const handleSettingsClick = () => {
        if (!settingsView) setSettingsView(true)
        else setSettingsView(false)
    }
    return (
        <>
            <div className='header__container'>
                <h2 className='header__logo'>LOGO</h2>
                <span className="header__addButton material-symbols-outlined">
                    add_circle
                </span>
                <h2 className='header__search'>Search</h2>
                <h2 className='header__settings' onClick={handleSettingsClick}>Settings</h2>

            </div>
            {settingsView && <SettingsDropdown />}
        </>
    )
}

export default Header