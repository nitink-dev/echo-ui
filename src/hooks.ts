// hooks.ts
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './store';

// Use this instead of plain useDispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();
