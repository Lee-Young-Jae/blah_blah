import { NextApiRequest, NextApiResponse } from 'next';
import MemberModel from '@/models/member/member.model';
import BadReqError from './error/bad_request_error';

async function add(req: NextApiRequest, res: NextApiResponse) {
  const { uid, email, displayName, photoURL } = req.body;

  if (uid === undefined || uid === null) {
    throw new BadReqError('사용자 정보(uid)가 없습니다.');
  }
  if (email === undefined || email === null) {
    throw new BadReqError('사용자 정보(email)가 없습니다.');
  }

  const addResult = await MemberModel.add({ uid, email, displayName, photoURL });
  if (!addResult.result) {
    return res.status(500).json(addResult);
  }
  return res.status(200).json(addResult);
}

async function findByScreenName(req: NextApiRequest, res: NextApiResponse) {
  const { screenName } = req.query;

  if (screenName === undefined || screenName === null) {
    throw new BadReqError('사용자 정보(screenName)가 없습니다.');
  }

  const extractScreenName = Array.isArray(screenName) ? screenName[0] : screenName;
  const findResult = await MemberModel.findByScreenName(extractScreenName);
  if (findResult === null) {
    return res.status(404).end();
  }
  return res.status(200).json(findResult);
}

const MemberCtrl = {
  add,
  findByScreenName,
};

export default MemberCtrl;
