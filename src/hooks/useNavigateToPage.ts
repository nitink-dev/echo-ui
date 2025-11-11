// import { useSetRecoilState } from 'recoil';
// import { appStateAtom, AppState } from '../state/appStateAtom';
// import { PageType } from '../types/types';

// /**
//  * Generic navigation hook for any entity/page.
//  */
// export function useNavigateToPage<T = any>() {
//   const setAppState = useSetRecoilState(appStateAtom);

//   const navigateToPage = (page: PageType, item?: T) => {
//     setAppState((prev: AppState) => ({
//       ...prev,
//       currentPage: page,
//       selectedItem: item || null,
//     }));
//   };

//   return navigateToPage;
// }
