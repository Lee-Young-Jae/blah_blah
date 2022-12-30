import React, { useState } from 'react';
import ResizeTextArea from 'react-textarea-autosize';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { InMessage } from '@/models/message/in_message';
import convertDateToString from '@/utils/convert_date_to_string';
import MoreBtnIcon from './more_btn_icon';
import FirebaseClient from '@/models/firebase_client';

interface Props {
  uid: string;
  photoURL: string;
  screenName: string;
  displayName: string;
  isOwner: boolean;
  item: InMessage;
  onSendComplete: () => void;
}

const MessageItem = function ({ photoURL, uid, screenName, displayName, isOwner, item, onSendComplete }: Props) {
  const [reply, setReply] = useState('');
  const tosast = useToast();

  async function postReply() {
    const resp = await fetch('/api/messages.add.reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid,
        reply,
        messageId: item.id,
      }),
    });

    if (resp.status < 300) {
      onSendComplete();
    }
  }

  async function updateMessage({ deny }: { deny: boolean }) {
    const token = await FirebaseClient.getInstance().Auth.currentUser?.getIdToken();
    if (token === undefined) {
      tosast({
        title: '로그인이 필요합니다.',
        status: 'error',
      });
      return;
    }
    const resp = await fetch('/api/messages.deny', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        authorization: token,
      },

      body: JSON.stringify({
        uid,
        messageId: item.id,
        deny,
      }),
    });

    if (resp.status < 300) {
      onSendComplete();
    }
  }

  const haveReply = item.reply !== undefined;
  const isDeny = item.deny !== undefined ? item.deny === true : false;
  return (
    <Box bg="white" borderRadius="md" boxShadow="md" borderColor="gray" width="full">
      <Box>
        <Flex px="2" pt="2" alignItems="center">
          <Avatar
            size="xs"
            src={item.author ? item.author.photoURL ?? 'https://bit.ly/broken-link' : 'https://bit.ly/broken-link'}
          />
          <Text fontSize="xx-small" ml="1">
            {item.author ? item.author.displayName : 'anonymous'}
          </Text>
          <Text whiteSpace="pre-line" fontSize="xx-small" ml="1" color="gray.500">
            {convertDateToString(item.createAt)}
          </Text>
          <Spacer />
          {isOwner && (
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<MoreBtnIcon />}
                width="24px"
                height="24px"
                borderRadius="full"
                variant="link"
                size="xs"
              />
              <MenuList>
                <MenuItem
                  onClick={() => {
                    updateMessage({ deny: item.deny !== undefined ? !item.deny : true });
                  }}
                >
                  {isDeny ? '비공개 처리 해제' : '비공개 처리'}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    window.location.href = `/${screenName}/${item.id}`;
                  }}
                >
                  메세지 상세 보기
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
        <Box p="2">
          <Box borderRadius="md" borderWidth="1px" p="2">
            <Text whiteSpace="pre-line" fontSize="sm">
              {item.message}
            </Text>
          </Box>
          {haveReply && (
            <Box pt="2">
              <Divider />
              <Box display="flex" mt="2">
                <Box pt="2">
                  <Avatar size="xs" src={photoURL} mr="2" />
                </Box>
                <Box borderRadius="md" p="2" width="full" bg="gray.100">
                  <Flex alignItems="center">
                    <Text fontSize="xs">{displayName}</Text>
                    <Text whiteSpace="pre-line" fontSize="xs" color="gray">
                      {convertDateToString(item.replyAt!)}
                    </Text>
                  </Flex>
                  <Text whiteSpace="pre-line" fontSize="xs">
                    {item.reply}
                  </Text>
                </Box>
              </Box>
            </Box>
          )}
          {!haveReply && isOwner && (
            <Box pt="2">
              <Divider />
              <Box display="flex" mt="2">
                <Box pt="1">
                  <Avatar size="xs" src={photoURL} mr="2" />
                </Box>
                <Box borderRadius="md" width="full" bg="gray.100" mr="2">
                  <Textarea
                    border="none"
                    boxShadow="none !important"
                    resize="none"
                    minH="unset"
                    overflow="hidden"
                    fontSize="xs"
                    placeholder="댓글을 입력하세요..."
                    as={ResizeTextArea}
                    value={reply}
                    onChange={(e) => {
                      setReply(e.currentTarget.value);
                    }}
                  />
                </Box>
                <Button
                  disabled={reply.length === 0}
                  onClick={() => {
                    postReply();
                  }}
                  colorScheme="pink"
                  bgColor="#ff75b5"
                  variant="solid"
                  size="sm"
                >
                  등록
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MessageItem;
