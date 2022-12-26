import { NextApiRequest, NextApiResponse } from 'next';
import MessageModel from '@/models/message/message.model';
import BadReqError from './error/bad_request_error';

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
  const { uid } = req.query;
  if (uid === undefined) {
    throw new BadReqError('uid is undefined');
  }
  const uidToString = Array.isArray(uid) ? uid[0] : uid;
  const listResp = await MessageModel.list({ uid: uidToString });
  return res.status(200).json(listResp);
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

const MessageCtrl = {
  post,
  list,
  postReply,
};

export default MessageCtrl;
