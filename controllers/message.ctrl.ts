import { NextApiRequest, NextApiResponse } from 'next';
import MessageModel from '@/models/message/message.model';
import BadReqError from './error/bad_request_error';
import CustomServerError from './error/custom_server_error';
import FirebaseAdmin from '@/models/firebase_admin';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { uid, message, author } = req.body;
  if (uid === undefined) {
    throw new BadReqError('uid is undefined');
  }
  if (message === undefined) {
    throw new BadReqError('message is undefined');
  }
  await MessageModel.post({ uid, message, author });

  return res.status(201).end();
}

async function list(req: NextApiRequest, res: NextApiResponse) {
  const { uid, page, size } = req.query;
  if (uid === undefined) {
    throw new BadReqError('uid is undefined');
  }
  const convertPage = page === undefined ? '1' : page;
  const convertSize = size === undefined ? '10' : size;
  const uidToString = Array.isArray(uid) ? uid[0] : uid;
  const pageToString = Array.isArray(convertPage) ? convertPage[0] : convertPage;
  const sizeToString = Array.isArray(convertSize) ? convertSize[0] : convertSize;
  const listResp = await MessageModel.listWithPage({
    uid: uidToString,
    page: parseInt(pageToString, 10),
    size: parseInt(sizeToString, 10),
  });
  return res.status(200).json(listResp);
}

async function get(req: NextApiRequest, res: NextApiResponse) {
  const { uid, messageId } = req.query;

  if (uid === undefined) {
    throw new BadReqError('uid is undefined');
  }

  if (messageId === undefined) {
    throw new BadReqError('messageId is undefined');
  }

  const uidToString = Array.isArray(uid) ? uid[0] : uid;
  const messageIdToString = Array.isArray(messageId) ? messageId[0] : messageId;

  const data = await MessageModel.get({ uid: uidToString, messageId: messageIdToString });
  return res.status(200).json(data);
}

async function postReply(req: NextApiRequest, res: NextApiResponse) {
  const { uid, reply, messageId } = req.body;

  if (uid === undefined) {
    throw new BadReqError('uid is undefined');
  }

  if (reply === undefined) {
    throw new BadReqError('reply is undefined');
  }

  if (messageId === undefined) {
    throw new BadReqError('messageId is undefined');
  }

  await MessageModel.postReply({ uid, reply, messageId });
  return res.status(201).end();
}

async function updateMessage(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization;

  if (token === undefined) {
    throw new CustomServerError({ statusCode: 401, message: '유저 토큰이 없습니다.' });
  }

  let tokenUid: null | string = null;
  try {
    const decode = await FirebaseAdmin.getInstance().Auth.verifyIdToken(token);
    tokenUid = decode.uid;
  } catch (e) {
    throw new BadReqError('토큰이 유효하지 않습니다.');
  }

  const { uid, messageId, deny } = req.body;

  if (uid === undefined) {
    throw new BadReqError('uid is undefined');
  }

  if (tokenUid !== uid) {
    throw new CustomServerError({ statusCode: 401, message: '수정 권한이 없습니다.' });
  }

  if (messageId === undefined) {
    throw new BadReqError('messageId is undefined');
  }

  if (deny === undefined) {
    throw new BadReqError('deny is undefined');
  }

  const result = await MessageModel.updateMessage({ uid, messageId, deny });
  return res.status(200).json(result);
}

const MessageCtrl = {
  post,
  updateMessage,
  list,
  get,
  postReply,
};

export default MessageCtrl;
