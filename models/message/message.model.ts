import { firestore } from 'firebase-admin';
import CustomServerError from '@/controllers/error/custom_server_error';
import FirebaseAdmin from '../firebase_admin';
import { InMessage, InMessageServer } from './in_message';

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

async function list({ uid }: { uid: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const listData = await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'Not Found User' });
    }
    const messageCol = memberRef.collection(MESSAGE_COL);
    const messageDocs = await transaction.get(messageCol);
    const data = messageDocs.docs.map((mv) => {
      const docData = mv.data() as Omit<InMessageServer, 'id'>;
      const returnData = {
        ...docData,
        id: mv.id,
        createAt: docData.createAt.toDate().toISOString(),
        replyAt: docData.replyAt?.toDate().toISOString(),
      } as InMessage;
      return returnData;
    });
    return data;
  });

  return listData;
}

async function postReply({ uid, messageId, reply }: { uid: string; messageId: string; reply: string }) {
  const memberRef = Firestore.collection(MEMBER_COL).doc(uid);
  const messageRef = Firestore.collection(MEMBER_COL).doc(uid).collection(MESSAGE_COL).doc(messageId);
  await Firestore.runTransaction(async (transaction) => {
    const memberDoc = await transaction.get(memberRef);
    const messageDoc = await transaction.get(messageRef);

    if (memberDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'Not Found User' });
    }
    if (messageDoc.exists === false) {
      throw new CustomServerError({ statusCode: 400, message: 'Not Found Message' });
    }

    const messageData = messageDoc.data() as InMessageServer;
    if (messageData.reply !== undefined) {
      throw new CustomServerError({ statusCode: 400, message: 'Already Replied' });
    }
    await transaction.update(messageRef, {
      reply,
      replyAt: firestore.FieldValue.serverTimestamp(),
    });
  });
}

const MessageModel = {
  post,
  list,
  postReply,
};

export default MessageModel;
