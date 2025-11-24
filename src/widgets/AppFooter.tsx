import { Flex, Text } from "@chakra-ui/react";
import React from "react";

export const AppFooter = () => {
  return (
    <Flex
      justify="center"
      alignItems="center"
      w="100%"
      p={{ base: "24px 16px", md: "40px 16px" }}
      mt={{ base: "24px", md: "40px" }}
    >
      <Text
        fontSize="12px"
        color="gray.500"
        textAlign="center"
      >
        © Predictus Fund I, 2025
      </Text>
    </Flex>
  );
};
