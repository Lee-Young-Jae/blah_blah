import { firestore } from 'firebase-admin';

interface MessageBase {
  id: string;
  /** 사용자가 남긴 질문 */
  message: string;
  /** 사용자가 남긴 질문에 대한 답변 */
  reply?: string;
  author?: {
    displayName: string;
    photoURL: string;
  };
}

export interface InMessage extends MessageBase {
  createAt: string;
  replyAt?: string;
}

export interface InMessageServer extends MessageBase {
  createAt: firestore.Timestamp;
  replyAt?: firestore.Timestamp;
}
