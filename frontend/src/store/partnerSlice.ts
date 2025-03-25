import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PartnerInfo {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  joinDate: string;
}

type ViewType = 'you' | 'partner' | 'combined';

interface PartnerState {
  linkedStatus: 'unlinked' | 'pending' | 'linked';
  partnerInfo: PartnerInfo | null;
  activeView: ViewType;
  linkCode: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: PartnerState = {
  linkedStatus: 'unlinked',
  partnerInfo: null,
  activeView: 'you',
  linkCode: null,
  isLoading: false,
  error: null
};

const partnerSlice = createSlice({
  name: 'partner',
  initialState,
  reducers: {
    changeActiveView: (state, action: PayloadAction<ViewType>) => {
      state.activeView = action.payload;
    },
    generateLinkStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    generateLinkSuccess: (state, action: PayloadAction<string>) => {
      state.linkCode = action.payload;
      state.isLoading = false;
    },
    generateLinkFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    linkPartnerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    linkPartnerSuccess: (state, action: PayloadAction<PartnerInfo>) => {
      state.linkedStatus = 'linked';
      state.partnerInfo = action.payload;
      state.isLoading = false;
    },
    linkPartnerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    unlinkPartner: (state) => {
      state.linkedStatus = 'unlinked';
      state.partnerInfo = null;
    }
  }
});

export const { 
  changeActiveView, 
  generateLinkStart,
  generateLinkSuccess,
  generateLinkFailure,
  linkPartnerStart,
  linkPartnerSuccess,
  linkPartnerFailure,
  unlinkPartner
} = partnerSlice.actions;
export default partnerSlice.reducer;