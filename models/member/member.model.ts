import FirebaseAdmin from '../firebase_admin';
import { InAuthUser } from '../in_auth_user';

const MEMBER_COL = 'members';
const SCREEN_NAME_COL = 'screen_names';

type AddResult = { result: true; id: string } | { result: false; message: string };

async function add({ uid, displayName, email, photoURL }: InAuthUser): Promise<AddResult> {
  try {
    // 1번 수행중 에러가 발생하면 1번을 롤백하고 2번도 롤백한다. (트랜잭션)
    // firebase는 트랜잭션을 지원한다.

    const screenName = (email as string).replace(/@.*/, '');
    const addResult = await FirebaseAdmin.getInstance().Firestore.runTransaction(async (transaction) => {
      const memberRef = FirebaseAdmin.getInstance().Firestore.collection(MEMBER_COL).doc(uid);
      const screenNameRef = FirebaseAdmin.getInstance().Firestore.collection(SCREEN_NAME_COL).doc(screenName);
      const memberDoc = await transaction.get(memberRef);
      if (memberDoc.exists) {
        // 이미 추가된 상태
        return false;
      }
      const addData = {
        uid,
        email,
        displayName: displayName ?? '',
        photoURL: photoURL ?? '',
      };
      transaction.set(memberRef, addData);
      transaction.set(screenNameRef, addData);
      return true;
    });
    if (!addResult) {
      return { result: true, id: uid };
    }
    return { result: true, id: uid };
  } catch (error) {
    return { result: false, message: 'Server Error' };
  }
}

async function findByScreenName(screenName: string): Promise<InAuthUser | null> {
  const memberRef = FirebaseAdmin.getInstance().Firestore.collection(SCREEN_NAME_COL).doc(screenName);

  const memberDoc = await memberRef.get();

  if (memberDoc.exists === false) {
    return null;
  }
  return memberDoc.data() as InAuthUser;
}

const MemberModel = {
  add,
  findByScreenName,
};

export default MemberModel;
