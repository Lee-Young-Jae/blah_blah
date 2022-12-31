import React, { useState } from 'react';
import ResizeTextArea from 'react-textarea-autosize';
import { GetServerSideProps, NextPage } from 'next';
import { useQuery } from 'react-query';
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Switch,
  Text,
  Textarea,
  useToast,
  VStack,
} from '@chakra-ui/react';
import axios, { AxiosResponse } from 'axios';
import { useAuth } from '@/contexts/auth_ser.context';
import ServiceLayout from '@/components/service_layout';
import { InAuthUser } from '@/models/in_auth_user';
import MessageItem from '@/components/message_item';
import { InMessage } from '@/models/message/in_message';

interface Props {
  userInfo: InAuthUser | null;
  screenName: string;
}

async function postMessage({
  uid,
  message,
  author,
}: {
  uid: string;
  message: string;
  author?: {
    displayName: string;
    photoURL?: string;
  };
}) {
  if (message.length <= 0) {
    return {
      result: false,
      message: '메시지가 없습니다.',
    };
  }
  try {
    await fetch('/api/messages.add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid,
        message,
        author,
      }),
    });
    return {
      result: true,
    };
  } catch (error) {
    console.error(error);
    return {
      result: false,
      message: '메시지 전송에 실패했습니다.',
    };
  }
}

const UserHomePage: NextPage<Props> = function ({ userInfo, screenName }) {
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [messageList, setMessageList] = useState<InMessage[]>([]);
  const [messageListFetchTrigger, setMessageListFetchTrigger] = useState(false);

  const toast = useToast();
  const { authUser } = useAuth();

  async function fetchMessageInfo({ uid, messageId }: { uid: string; messageId: string }) {
    try {
      const resp = await fetch(`/api/messages.info?uid=${uid}&messageId=${messageId}`);
      if (resp.status === 200) {
        const data: InMessage = await resp.json();
        setMessageList((prev) => {
          const findIndex = prev.findIndex((fv) => fv.id === data.id);
          if (findIndex >= 0) {
            const updateArr = [...prev];
            updateArr[findIndex] = data;
            return updateArr;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  const messageListQueryKey = ['messageList', userInfo?.uid, page, messageListFetchTrigger];
  useQuery(
    messageListQueryKey,
    async () =>
      // eslint-disable-next-line no-return-await
      await axios.get<{
        totalElements: number;
        totalPages: number;
        page: number;
        size: number;
        content: InMessage[];
      }>(`/api/messages.list?uid=${userInfo?.uid}&page=${page}&size=10`),
    {
      // react-query 옵션
      keepPreviousData: true, // 이전 데이터를 유지하고 새로운 데이터가 오면 이전 데이터와 합친다.
      refetchOnWindowFocus: false, // 창이 포커스 되었을 때 다시 요청을 보내지 않는다.
      onSuccess: (data) => {
        // 요청이 성공했을 때
        setTotalPages(data.data.totalPages);
        if (page === 1) {
          setMessageList(data.data.content);
          return;
        }
        setMessageList((prev) => [...prev, ...data.data.content]);
      },
    },
  );

  if (userInfo === null) {
    return (
      <Center bg="#FFB86C" h="50px" color="white">
        <Avatar size="sm" mr="3" src="https://bit.ly/broken-link" />
        해당 사용자를 찾지 못했어요...
      </Center>
    );
  }

  const isOwner = authUser !== null && authUser.uid === userInfo.uid;
  return (
    <ServiceLayout title={`${screenName}의 홈`} backgroundColor="gray.100" minH="100vh">
      <Box maxW="md" mx="auto" pt="6">
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

        <Box borderWidth="1px" bgColor="white" borderRadius="lg" overflow="hidden" mb="2">
          <Flex p="2" alignItems="center">
            <Avatar
              mr="2"
              size="xs"
              src={isAnonymous ? 'https://bit.ly/broken-link' : authUser?.photoURL ?? 'https://bit.ly/broken-link'}
              // name={`${authUser?.displayName}PHOTO_URL`}
            />
            <Textarea
              bg="gray.100"
              border="none"
              placeholder="무엇이 궁금한가요?"
              resize="none"
              minH="unset"
              overflow="hidden"
              fontSize="sm"
              mr="2"
              as={ResizeTextArea}
              maxRows={7}
              value={message}
              onChange={(e) => {
                if (e.currentTarget.value) {
                  const lineCount = (e.currentTarget.value.match(/[^\n]*\n[^\n]*/gi)?.length || 1) + 1;
                  if (lineCount > 7) {
                    toast({
                      title: '최대 7줄까지 입력 가능합니다.',
                      position: 'top-right',
                      status: 'warning',
                      duration: 2000,
                    });
                    setMessage(message);
                    return;
                  }
                  if (e.currentTarget.value.length > 700) {
                    toast({
                      title: '최대 700자까지 입력 가능합니다.',
                      position: 'top-right',
                      status: 'warning',
                      duration: 2000,
                    });
                    setMessage(message);
                    return;
                  }
                }
                setMessage(e.currentTarget.value);
              }}
            />
            <Button
              disabled={message.length === 0}
              bgColor="#FFBB6C"
              color="white"
              colorScheme="yellow"
              variant="solid"
              size="sm"
              onClick={async () => {
                const postData: {
                  uid: string;
                  message: string;
                  author?: { displayName: string; photoURL?: string };
                } = {
                  uid: userInfo.uid,
                  message,
                };
                if (isAnonymous === false) {
                  postData.author = {
                    photoURL: authUser?.photoURL ?? 'https://bit.ly/broken-link',
                    displayName: authUser?.displayName ?? 'anonymous',
                  };
                }
                const messageResp = await postMessage(postData);
                if (messageResp.result === false) {
                  toast({
                    title: messageResp.message,
                    position: 'top-right',
                    status: 'error',
                    duration: 2000,
                  });
                  return;
                }
                setMessage('');
                setPage(1);
                setTimeout(() => {
                  setMessageListFetchTrigger((prev) => !prev);
                }, 50);
              }}
            >
              등록
            </Button>
          </Flex>
          <FormControl display="flex" alignItems="center" mx="2" pb="2">
            <Switch
              isChecked={isAnonymous}
              onChange={() => {
                if (authUser === null) {
                  toast({
                    title: '로그인 후 이용해주세요.',
                    position: 'top-right',
                    status: 'warning',
                    duration: 2000,
                  });
                  setIsAnonymous(true);
                  return;
                }
                setIsAnonymous((prev) => !prev);
              }}
              size="sm"
              colorScheme="orange"
              id="anonymous"
              mr="1"
            />
            <FormLabel htmlFor="anonymous" mb="0" fontSize="xx-small">
              Anonymous
            </FormLabel>
          </FormControl>
        </Box>
        <VStack spacing="12px" mt="6">
          {messageList?.map((messageData) => (
            <MessageItem
              key={`message-item-${userInfo.uid}-${messageData.id}`}
              item={messageData}
              uid={userInfo.uid}
              screenName={screenName}
              displayName={userInfo.displayName ?? 'anonymous'}
              photoURL={messageData.author?.photoURL ?? './'}
              replyPhotoURL={userInfo.photoURL ?? './'}
              isOwner={isOwner}
              onSendComplete={() => {
                fetchMessageInfo({ uid: userInfo.uid, messageId: messageData.id });
              }}
            />
          ))}
        </VStack>
        {totalPages > page && (
          <Button
            width="full"
            mt="2"
            fontSize="sm"
            onClick={() => {
              setPage((prev) => prev + 1);
            }}
          >
            더보기
          </Button>
        )}
      </Box>
    </ServiceLayout>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const { screenName } = query;
  if (screenName === undefined) {
    return {
      props: {
        userInfo: null,
        screenName: '',
      },
    };
  }
  const screenNameToString = Array.isArray(screenName) ? screenName[0] : screenName;
  try {
    const protocol = process.env.PROTOCAL || 'http';
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || '3000';
    const baseUrl = `${protocol}://${host}:${port}`;
    const userInfoResp: AxiosResponse<InAuthUser> = await axios(`${baseUrl}/api/user.info/${screenName}`);

    return {
      props: {
        userInfo: userInfoResp.data ?? null,
        screenName: screenNameToString,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        userInfo: null,
        screenName: '',
      },
    };
  }
};

export default UserHomePage;
