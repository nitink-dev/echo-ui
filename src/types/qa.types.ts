export interface QASlideParameter {
    id: string;
    barcode: string;
    activationCode: string;
    dicomWebUrl?: string;
  }
  
  export interface QAFormData {
    barcode: string;
    activationCode: string;
  }