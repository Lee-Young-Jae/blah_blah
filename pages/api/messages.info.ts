import { NextApiRequest, NextApiResponse } from 'next';
import MessageCtrl from '@/controllers/message.ctrl';
import handleError from '@/controllers/error/handle.error';
import checkSupportMethod from '@/controllers/error/check_support_method';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const supportMethods = ['GET'];
  try {
    checkSupportMethod(supportMethods, method);
    await MessageCtrl.get(req, res);
  } catch (error) {
    console.error(error);
    // 에러 처리
    handleError(error, res);
  }
}
