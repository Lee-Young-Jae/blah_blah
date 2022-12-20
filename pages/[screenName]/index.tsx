import React, { useState } from 'react';
import ResizeTextArea from 'react-textarea-autosize';
import { NextPage } from 'next';
import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Radio,
  Switch,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '@/contexts/auth_ser.context';
import ServiceLayout from '@/components/service_layout';

const userInfo = {
  uid: '123124214',
  displayName: 'test',
  email: 'yjlee1937@gmail.com',
  photoURL: 'https://avatars.githubusercontent.com/u/78532129?v=4',
};

const UserHomePage: NextPage = function () {
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);

  const { authUser } = useAuth();

  const toast = useToast();
  return (
    <ServiceLayout title="test" backgroundColor="gray.100" minH="100vh">
      <Box maxW="md" mx="auto" pt="6">
        <Box borderWidth="1px" bgColor="white" borderRadius="lg" overflow="hidden" mb="2">
          <Flex p="6">
            <Avatar size="lg" src={userInfo.photoURL} name={`${userInfo.displayName}PHOTO_URL`} mr="2" />
            <Flex direction="column" justify="center">
              <Text fontSize="md">{authUser?.displayName}</Text>
              <Text fontSize="xs">{authUser?.email}</Text>
            </Flex>
          </Flex>
        </Box>

        <Box borderWidth="1px" bgColor="white" borderRadius="lg" overflow="hidden" mb="2">
          <Flex p="2" alignItems="center">
            <Avatar
              mr="2"
              size="xs"
              src={isAnonymous ? 'https://bit.ly/broken-link' : userInfo?.photoURL ?? 'https://bit.ly/broken-link'}
              name={`${userInfo.displayName}PHOTO_URL`}
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

export default UserHomePage;
