import Head from 'next/head'
import NextLink from 'next/link'
import { Text, Flex, Button, Link, useMediaQuery } from '@chakra-ui/react'


export default function Home() {
  const [isLargerThan600] = useMediaQuery("(min-width: 800px)", {
    ssr: true,
    fallback: false
  })

  return (
    <Flex w='100%' h='100vh' bgColor='black' direction='column'>
      <Flex p={isLargerThan600 ? '0% 10%' : '20% 10%'} w='100%' justify={isLargerThan600 ? 'space-between' : 'center'} align='center' h='8vh'>
        <Text fontSize='30px'>GAINCOIN</Text>
        <Link as={NextLink} href='/airdrop'>
          <Button display={isLargerThan600 ? 'flex' : 'none'} _hover={{ backgroundColor: 'limegreen', color: 'black'}} border='1px solid limegreen' borderRadius='0px' bgColor='black'>join airdrop</Button>
        </Link>
      </Flex>
      <Flex h={isLargerThan600 ? '84vh' : '70vh'} align='center' justify='center'>
        <Flex>
        </Flex>
        <Flex p={isLargerThan600 ? '' : '0% 10%'} direction='column' textAlign='center'>
          <Text>A revolutionary meme coin that will take your gains far past the moon.</Text>
          <Text fontSize='1.5rem' mt='2rem'>COMING SOON...</Text>
          {!isLargerThan600 ? 
            <Flex justify='center'>
              <Link as={NextLink} href='/airdrop'>
                <Button mt='2rem' _hover={{ backgroundColor: 'limegreen', color: 'black'}} border='1px solid limegreen' borderRadius='0px' bgColor='black'>join airdrop</Button>
              </Link>
            </Flex>
            : null
          }
        </Flex>
      </Flex>
    </Flex>
  )
}
