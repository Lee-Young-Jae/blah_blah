import React, { useState } from 'react';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { Avatar, Box, Button, Center, Flex, Text } from '@chakra-ui/react';
import axios, { AxiosResponse } from 'axios';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth_ser.context';
import ServiceLayout from '@/components/service_layout';
import { InAuthUser } from '@/models/in_auth_user';
import MessageItem from '@/components/message_item';
import { InMessage } from '@/models/message/in_message';

interface Props {
  userInfo: InAuthUser | null;
  messageData: InMessage | null;
  screenName: string;
  baseUrl: string;
}

const MessagePage: NextPage<Props> = function ({ userInfo, messageData: initialMessageData, screenName, baseUrl }) {
  const [messageData, setMessageData] = useState<InMessage | null>(initialMessageData);
  const { authUser } = useAuth();

  async function fetchMessageInfo({ uid, messageId }: { uid: string; messageId: string }) {
    try {
      const resp = await fetch(`/api/messages.info?uid=${uid}&messageId=${messageId}`);
      if (resp.status === 200) {
        const data: InMessage = await resp.json();
        setMessageData(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (userInfo === null) {
    return (
      <Center bg="#FFB86C" h="50px" color="white">
        <Avatar size="sm" mr="3" src="https://bit.ly/broken-link" />
        해당 사용자를 찾지 못했어요...
      </Center>
    );
  }

  if (messageData === null) {
    return (
      <Center bg="#FFB86C" h="50px" color="white">
        <Avatar size="sm" mr="3" src="https://bit.ly/broken-link" />
        메시지 정보를 찾지 못했어요...
      </Center>
    );
  }

  const isOwner = authUser !== null && authUser.uid === userInfo.uid;
  const metaImgUrl = `${baseUrl}/open-graph-img?text=${encodeURIComponent(messageData.message)}`;
  const thumbnailImgUrl = `${baseUrl}/api/thumbnail?url=${encodeURIComponent(metaImgUrl)}`;
  return (
    <>
      <Head>
        <meta property="og:image" content={thumbnailImgUrl} />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:site" content="@blahblah" />
        <meta property="twitter:title" content={messageData.message} />
        <meta property="twitter:image" content={thumbnailImgUrl} />
      </Head>
      <ServiceLayout title="test" backgroundColor="gray.100" minH="100vh">
        <Box maxW="md" mx="auto" pt="6">
          <Link href={`/${screenName}`}>
            <a>
              <Button mb="2" fontSize="sm">{`${screenName}님의 프로필로 이동할까요?`}</Button>
            </a>
          </Link>
          <Box borderWidth="1px" bgColor="white" borderRadius="lg" overflow="hidden" mb="2">
            <Flex p="6">
              <Avatar
                size="lg"
                src={userInfo?.photoURL ?? 'https://bit.ly/broken-link'}
                name={`${userInfo?.displayName}PHOTO_URL`}
                mr="2"
              />
              <Flex direction="column" justify="center">
                <Text fontSize="md">{userInfo?.displayName}</Text>
                <Text fontSize="xs">{userInfo?.email}</Text>
              </Flex>
            </Flex>
          </Box>
          <MessageItem
            item={messageData}
            uid={userInfo.uid}
            screenName={screenName}
            displayName={userInfo.displayName ?? 'anonymous'}
            photoURL={messageData.author?.photoURL ?? './'}
            isOwner={isOwner}
            onSendComplete={() => {
              fetchMessageInfo({ uid: userInfo.uid, messageId: messageData.id });
            }}
          />
        </Box>
      </ServiceLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const { screenName, messageId } = query;

  if (screenName === undefined) {
    return {
      props: {
        userInfo: null,
        messageData: null,
        screenName: '',
        baseUrl: '',
      },
    };
  }
  if (messageId === undefined) {
    return {
      props: {
        userInfo: null,
        messageData: null,
        screenName: '',
        baseUrl: '',
      },
    };
  }
  try {
    const protocol = process.env.PROTOCAL || 'http';
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || '3000';
    const baseUrl = `${protocol}://${host}:${port}`;
    const userInfoResp: AxiosResponse<InAuthUser> = await axios(`${baseUrl}/api/user.info/${screenName}`);
    const screenNameToString = Array.isArray(screenName) ? screenName[0] : screenName;
    if (userInfoResp.status !== 200 || userInfoResp.data === undefined || userInfoResp.data.uid === undefined) {
      return {
        props: {
          userInfo: userInfoResp.data ?? null,
          messageData: null,
          screenName: screenNameToString,
          baseUrl,
        },
      };
    }
    const messageInfoResp: AxiosResponse<InMessage> = await axios(
      `${baseUrl}/api/messages.info?uid=${userInfoResp.data.uid}&messageId=${messageId}`,
    );
    return {
      props: {
        userInfo: userInfoResp.data ?? null,
        messageData: messageInfoResp.status !== 200 || messageInfoResp.data === undefined ? null : messageInfoResp.data,
        screenName: screenNameToString,
        baseUrl,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        userInfo: null,
        messageData: null,
        screenName: '',
        baseUrl: '',
      },
    };
  }
};

export default MessagePage;
