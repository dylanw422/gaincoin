import Head from 'next/head'
import { Text, Flex, Button, Image } from '@chakra-ui/react'


export default function Home() {
  return (
    <Flex w='100%' h='100vh' bgColor='black' direction='column'>
      <Flex pl='10%' pr='10%' w='100%' justify='space-between' align='center' h='8vh'>
        <Text fontSize='30px'>GAINCOIN</Text>
        <Button _hover={{ backgroundColor: 'orange', color: 'black'}} border='1px solid orange' borderRadius='0px' bgColor='black' onClick={() => window.location.href='/airdrop'}>join airdrop</Button>
      </Flex>
      <Flex h='84vh' align='center' justify='center'>
        <Flex>
        </Flex>
        <Flex direction='column' textAlign='center'>
          <Text>A revolutionary meme coin that will take your gains far past the moon.</Text>
          <Text mt='1rem'>COMING SOON...</Text>
        </Flex>
      </Flex>
    </Flex>
  )
}
