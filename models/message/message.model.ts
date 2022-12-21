import { firestore } from 'firebase-admin';
import CustomServerError from '@/controllers/error/custom_server_error';
import FirebaseAdmin from '../firebase_admin';

const MEMBER_COL = 'members';
const MESSAGE_COL = 'messages';
const SCREEN_NAME_COL = 'screen_names';

const { Firestore } = FirebaseAdmin.getInstance();

async function post({
  uid,
  message,
  author,
}: {
  uid: string;
  message: string;
  author?: {
    displayName: string;
    photoURL: string;
  };
}) {
  const messageRef = Firestore.collection(MEMBER_COL).doc(uid);
  await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(messageRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'Not Found User' });
    }
    const newMessageRef = messageRef.collection(MESSAGE_COL).doc();
    const newMessageBody: {
      message: string;
      createAt: firestore.FieldValue;
      author?: {
        displayName: string;
        photoURL: string;
      };
    } = {
      message,
      createAt: firestore.FieldValue.serverTimestamp(),
    };
    if (author !== undefined) {
      newMessageBody.author = author;
    }
    await transaction.set(newMessageRef, newMessageBody);
  });
}

const MessageModel = {
  post,
};

export default MessageModel;
