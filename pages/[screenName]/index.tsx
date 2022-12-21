import React, { useState } from 'react';
import ResizeTextArea from 'react-textarea-autosize';
import { GetServerSideProps, NextPage } from 'next';
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
} from '@chakra-ui/react';
import axios, { AxiosResponse } from 'axios';
import { useAuth } from '@/contexts/auth_ser.context';
import ServiceLayout from '@/components/service_layout';
import { InAuthUser } from '@/models/in_auth_user';

interface Props {
  userInfo: InAuthUser | null;
}

const UserHomePage: NextPage<Props> = function ({ userInfo }) {
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const { authUser } = useAuth();

  const toast = useToast();
  if (userInfo === null) {
    return (
      <Center bg="#FFB86C" h="50px" color="white">
        <Avatar size="sm" mr="3" src="https://bit.ly/broken-link" />
        해당 사용자를 찾지 못했어요...
      </Center>
    );
  }
  return (
    <ServiceLayout title="test" backgroundColor="gray.100" minH="100vh">
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
              name={`${authUser?.displayName}PHOTO_URL`}
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
      },
    };
  }
  try {
    const protocol = process.env.PROTOCAL || 'http';
    const host = process.env.HOST || 'localhost';
    const port = process.env.PORT || '3000';
    const baseUrl = `${protocol}://${host}:${port}`;
    const userInfoResp: AxiosResponse<InAuthUser> = await axios(`${baseUrl}/api/user.info/${screenName}`);
    console.info(userInfoResp.data);

    return {
      props: {
        userInfo: userInfoResp.data ?? null,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        userInfo: null,
      },
    };
  }
};

export default UserHomePage;
