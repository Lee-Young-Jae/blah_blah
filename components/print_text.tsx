import { Text } from '@chakra-ui/react';

const PrintText = function ({ printText }: { printText: string }) {
  const textCount = printText.length;
  const usedText = textCount > 200 ? `${printText.slice(0, 200)}...` : printText;
  return (
    <Text p="25px" whiteSpace="pre-line" position="absolute" fontSize="xl" fontFamily="Pretendard">
      {usedText}
    </Text>
  );
};

export default PrintText;
