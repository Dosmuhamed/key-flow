import { createContext, useContext } from 'react'
import { DEFAULT_APPEARANCE, type Appearance } from '../lib/appearance'

export const AppearanceContext = createContext<Appearance>(DEFAULT_APPEARANCE)

export const useAppearance = () => useContext(AppearanceContext)
