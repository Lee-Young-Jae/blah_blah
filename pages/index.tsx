import { NextPage } from 'next';
import { Box, Flex, Heading } from '@chakra-ui/react';
import ServiceLayout from '@/components/service_layout';
import GoogleLoginButton from '@/components/google_login_button';
import { useAuth } from '@/contexts/auth_ser.context';

const IndexPage: NextPage = function () {
  const { signInWithGoogle } = useAuth();
  return (
    <ServiceLayout title="Blah! 뭐든 물어보세요" backgroundColor="gray.50" minH="100vh">
      <Box maxW="md" mx="auto" pt="10">
        <img src="./logo.svg" alt="메인 로고" />
        <Flex justify="center">
          <Heading>#Blah Blah</Heading>
        </Flex>
      </Box>
      <GoogleLoginButton onClick={signInWithGoogle} />
    </ServiceLayout>
  );
};

export default IndexPage;
