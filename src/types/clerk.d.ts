export type VisitorType = 'recruiter' | 'client' | 'browsing';

declare global {
  interface UserUnsafeMetadata {
    visitorType?: VisitorType;
    reason?: string;
  }
}

export {};
