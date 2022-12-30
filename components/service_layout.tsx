/* eslint-disable react/jsx-props-no-spreading */
import { Box, BoxProps } from '@chakra-ui/react';
import Head from 'next/head';
import React from 'react';
import GNB from './GNB';

interface Props {
  title: string;
  children: React.ReactNode;
}

const ServiceLayout: React.FC<Props & BoxProps> = function ({ title = 'blah x2', children, ...boxProps }) {
  return (
    <Box {...boxProps}>
      <Head>
        <title>{title}</title>
      </Head>
      <GNB />

      {children}
    </Box>
  );
};

export default ServiceLayout;
