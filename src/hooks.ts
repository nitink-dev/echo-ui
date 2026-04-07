// hooks.ts
import { useDispatch } from 'react-redux';
import { AppDispatch } from './store/store';

// Use this instead of plain useDispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();
