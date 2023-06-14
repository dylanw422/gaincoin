import React, { useState, useEffect } from 'react'
import NextLink from 'next/link'
import { Text, Flex, Button, Input, useToast, Box, Link, IconButton, useDisclosure, Highlight} from "@chakra-ui/react"
import { Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverFooter, useMediaQuery } from '@chakra-ui/react'
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody } from '@chakra-ui/react'
import { Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import { useSession, signIn, signOut } from 'next-auth/react'
import { nanoid } from 'nanoid'

export default function Airdrop() {
    const { data: session } = useSession()
    const toast = useToast()
    const addressPattern = /^(0x)?[0-9a-fA-F]{40}$/
    const [address, setAddress] = useState('')
    const [twitter, setTwitter] = useState('')
    const [leaderboards, setLeaderboards] = useState([])
    const [currentUser, setCurrentUser] = useState()
    const [notOldEnough, setNotOldEnough] = useState(false)
    const [referrer, setReferrer] = useState()
    const [referrerData, setReferrerData] = useState()
    const [isLargerThan600] = useMediaQuery("(min-width: 800px)", {
        ssr: true,
        fallback: false
    })
    const [isOpenLeaderboard, setIsOpenLeaderboard] = useState(false)
    const [isOpenHowTo, setIsOpenHowTo] = useState(false)
    const handleOpenLeaderboard = () => {setIsOpenLeaderboard(true)}
    const handleOpenHowTo = () => {setIsOpenHowTo(true)}
    const handleCloseLeaderboard = () => {setIsOpenLeaderboard(false)}
    const handleCloseHowTo = () => {setIsOpenHowTo(false)}
    const { isOpen, onOpen, onClose } = useDisclosure()

    // Success & Error Toasts

    function successToast(message) {
        toast({
            position: 'top',
            render: () => (
                <Box mt={isLargerThan600 ? '0px' : '3rem'} textAlign='center' color='black' bgColor='limegreen' padding='1rem'>
                    {message}
                </Box>
            )
        })
    }

    function badToast(message) {
        toast({
            position: 'top',
            render: () => (
                <Box mt={isLargerThan600 ? '0px' : '3rem'} color='white' bgColor='red.600' padding='1rem'>
                    {message}
                </Box>
            )
        })
    }

    // establish all user's twitter handle and twitter age

    useEffect(() => {
        if (session) {
            setTwitter(session.twitter.twitterHandle)
            const createdAt = session.twitter.createdAt;
            const createdAtDate = new Date(createdAt);
            const currentDate = new Date();
            const monthsDifference = Math.floor((currentDate - createdAtDate) / (1000 * 60 * 60 * 24 * 30));
            
            if (monthsDifference <= 1) {
              setNotOldEnough(true);
            }
        }
    }, [session])

    // GET Request to fetch user object based on referral code

    async function getUserByCode(referrer) {
        try {
            const res = await fetch(`/api/getReferrer?referralCode=${referrer}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })

            const json = await res.json()
            setReferrerData(json)
        } catch (error) {
            console.log(error)
        }
    }

    // useEffect waiting for referralCode to be pasted, runs getUserByCode()

    useEffect(() => {
        if (referrer) {
            getUserByCode(referrer)
        }
    }, [referrer])


    // POST Request to register new user

    async function postData() {
        const validAddress = addressPattern.test(address);
      
        if (!validAddress) {
          badToast('Invalid ETH Address');
          return;
        }
      
        if (twitter === "") {
          badToast('Not Connected to Twitter');
          return;
        }
      
        if (notOldEnough) {
          badToast('Profile Not Eligible');
          return;
        }
      
        try {
          if (referrer) {
            if (referrerData === null) {
                badToast('Bad Invite Code')
                return
            }
          }
          const res = await fetch("/api/users", {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({
              address: address,
              referralCode: nanoid(10),
              referrer: (referrer === "" ? null : referrer)
            }),
          });
      
          const json = await res.json();
      
          if (res.ok) {
            successToast('Airdrop Confirmed');
            if (referrer) {
                successToast('Points Rewarded')
            }
          } else {
            badToast(json.error);
          }
        } catch (error) {
          console.error(error);
          badToast('An error occurred');
        }
    }

    // GET Request for all users *Leaderboard* sorted by points desc

    async function getLeaderboard() {
        const res = await fetch("/api/users", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })

        const json = await res.json()
        setLeaderboards(json)
    }

    // GET Request to fetch current user (does not use a toast) 

    async function getCurrentUser() {
         const res = await fetch(`/api/users?twitter=${twitter}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/jsopn"
            }
        })

        const json = await res.json()
        setCurrentUser(json)

    }

    // GET Request for user's invite code (gets user's object and copies referralCode to clipboard)

    async function getInviteCode() {
        if (!session) {
            badToast('Connect to Twitter')
            return
        }

        const res = await fetch(`/api/users?twitter=${twitter}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })

        const json = await res.json()
        setCurrentUser(json)

        if (json && json.referralCode) {
            navigator.clipboard.writeText(json.referralCode);
            successToast('Copied To Clipboard');
        }
    }

    return (
        <Flex direction='column' overflowX='none'>
            <Flex mt={isLargerThan600 ? '0px' : '3rem'} pl='10%' pr='10%' w={isLargerThan600 ? '100%' : '120%'} justify='space-between' align='center' h='8vh'>
                <Link _hover={{ textDecoration: 'none'}} as={NextLink} href='/'>
                    <Text fontSize='30px'>GAINCOIN</Text>
                </Link>
                {isLargerThan600 ? 
                    <Flex>
                        <Button mr='2rem' _hover={{ backgroundColor: 'limegreen', color: 'black' }} border='1px solid limegreen' borderRadius='0px' bgColor='black' onClick={() => getInviteCode()}>{currentUser ? currentUser.referralCode : 'invite code'}</Button>
                        <Popover>
                            <PopoverTrigger>
                                <Button _hover={{ backgroundColor: 'limegreen', color: 'black'}} border='1px solid limegreen' borderRadius='0px' bgColor='black' onClick={() => {getLeaderboard(), getCurrentUser()}}>leaderboard</Button>
                            </PopoverTrigger>
                            <PopoverContent w='100%' bgColor='black' borderRadius='0px' border='1px solid gray'>
                                <PopoverBody height='29rem' overflowY='scroll' overflowX='none'>
                                    <Flex pb='.5rem' justify='space-between'>
                                        <Text w='4rem' color='limegreen'>#</Text>
                                        <Text w='9rem' color='limegreen'>ADDRESS</Text>
                                        <Text w='7rem' textAlign='center' color='limegreen'>POINTS</Text>
                                        <Text w='5rem' textAlign='center' color='limegreen'>MULTI</Text>
                                    </Flex>
                                    {leaderboards.slice(0,100).map((item, index) => {
                                        let multi = 1;
                                        let multiColor = 'white'
                                        if (index < 10) {
                                            multi = 3
                                            multiColor = '#FFD700'
                                        } else if (index < 25) {
                                            multi = 2.5
                                            multiColor = '#8A2BE2'
                                        } else if (index < 50) {
                                            multi = 2
                                            multiColor = '#68BBE3'
                                        } else if (index < 100) {
                                            multi = 1.5
                                            multiColor = '#FF69B4'
                                        }
                                        return(
                                            <Flex p='.5rem 0rem' key={leaderboards.indexOf(item)} justify='space-between'>
                                                <Text w='4rem' textShadow={item.twitter === twitter ? '0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen, 0 0 12px limegreen' : null}>#{leaderboards.indexOf(item)+1}</Text>
                                                <Text w='9rem' textShadow={item.twitter === twitter ? '0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen, 0 0 12px limegreen' : null}>{`${item.address?.slice(0,10)}...`}</Text>
                                                <Text w='7rem' textAlign='center' textShadow={item.twitter === twitter ? '0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen, 0 0 12px limegreen' : null}>{item.points}</Text>
                                                <Text w='5rem' textAlign='center' textShadow={item.twitter === twitter ? `0 0 1px ${multiColor}, 0 0 2px ${multiColor}, 0 0 5px ${multiColor}, 0 0 12px ${multiColor}` : null}color={multiColor}>{multi}x</Text>
                                            </Flex>
                                        )
                                    })}
                                </PopoverBody>
                                    <PopoverFooter>
                                        <Flex p='1rem 0rem' justify='space-between'>
                                            <Text w='4rem' textShadow='0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen, 0 0 12px limegreen'>#{leaderboards.findIndex(obj => obj['twitter'] === twitter) + 1}</Text>
                                            <Text w='9rem' textShadow='0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen, 0 0 12px limegreen'>{currentUser?.address?.slice(0,10)}...</Text>
                                            <Text w='7rem' textAlign='center' textShadow='0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen, 0 0 12px limegreen'>{currentUser?.points}</Text>
                                            <Text w='5rem' textAlign='center' color={leaderboards.findIndex(obj => obj['twitter'] === twitter) < 10 ? '#FFD700' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 25 ? '#8A2BE2' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 50 ? '#68BBE3' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 100 ? '#FF69B4' : 'white'} 
                                                    textShadow={leaderboards.findIndex(obj => obj['twitter'] === twitter) < 10 ? '0 0 1px #FFD700, 0 0 2px #FFD700, 0 0 5px #FFD700, 0 0 12px #FFD700' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 25 ? '0 0 1px #8A2BE2, 0 0 2px #8A2BE2, 0 0 5px #8A2BE2, 0 0 12px #8A2BE2' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 50 ? '0 0 1px #68BBE3, 0 0 2px #68BBE3, 0 0 5px #68BBE3, 0 0 12px #68BBE3' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 100 ? '0 0 1px #FF69B4, 0 0 2px #FF69B4, 0 0 5px #FF69B4, 0 0 12px #FF69B4' : 'white'}>
                                                    {leaderboards.findIndex(obj => obj['twitter'] === twitter) < 10 ? '3x' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 25 ? '2.5x' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 50 ? '2x' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 100 ? '1.5x' : '1x'}</Text>
                                        </Flex> 
                                    </PopoverFooter>
                            </PopoverContent>
                        </Popover>
                    </Flex> : 
                    <Menu>
                        <MenuButton onClick={() => getCurrentUser()} borderRadius='0px' as={IconButton} aria-label='Menu' icon={<HamburgerIcon />} variant='outline' />
                        <MenuList borderRadius='0px' bgColor='black'> 
                            <Text p='1rem' onClick={() => getInviteCode()}>{currentUser ? currentUser.referralCode : 'Invite Code'}</Text>
                            <MenuItem onClick={() => {getLeaderboard(), getCurrentUser(), handleOpenLeaderboard()}} p='1rem' bgColor='black'>
                                Leaderboard
                                <Modal scrollBehavior='inside' onClose={handleCloseLeaderboard} isOpen={isOpenLeaderboard} isCentered>
                                    <ModalOverlay bgColor='#000'/>
                                    <ModalContent w='90%' h='70%' borderRadius='0%' bgColor='black' border='1px solid gray'>
                                    <ModalHeader textAlign='center'>Leaderboard</ModalHeader>
                                    <ModalBody>
                                         <Flex pb='1.5rem' direction='column'>
                                            <Text pb='1rem' fontSize='18px' textAlign='center' textShadow='0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen'>YOUR RANK</Text>
                                            <Flex fontSize='14px' justify='space-between'>
                                                <Text w='4rem' textShadow='0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen'>
                                                    #{leaderboards.findIndex(obj => obj['twitter'] === twitter) + 1}
                                                </Text>
                                                <Text w='9rem' textShadow='0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen'>
                                                    {currentUser?.address?.slice(0,10)}...
                                                </Text>
                                                <Text w='7rem' textAlign='center' textShadow='0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen'>
                                                    {currentUser?.points}
                                                </Text>
                                            <Text w='5rem' textAlign='center' color={leaderboards.findIndex(obj => obj['twitter'] === twitter) < 10 ? '#FFD700' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 25 ? '#8A2BE2' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 50 ? '#68BBE3' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 100 ? '#FF69B4' : 'white'} 
                                                    textShadow={leaderboards.findIndex(obj => obj['twitter'] === twitter) < 10 ? '0 0 1px #FFD700, 0 0 2px #FFD700, 0 0 5px #FFD700, 0 0 12px #FFD700' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 25 ? '0 0 1px #8A2BE2, 0 0 2px #8A2BE2, 0 0 5px #8A2BE2, 0 0 12px #8A2BE2' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 50 ? '0 0 1px #68BBE3, 0 0 2px #68BBE3, 0 0 5px #68BBE3, 0 0 12px #68BBE3' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 100 ? '0 0 1px #FF69B4, 0 0 2px #FF69B4, 0 0 5px #FF69B4, 0 0 12px #FF69B4' : 'white'}>
                                                    {leaderboards.findIndex(obj => obj['twitter'] === twitter) < 10 ? '3x' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 25 ? '2.5x' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 50 ? '2x' :
                                                    leaderboards.findIndex(obj => obj['twitter'] === twitter) < 100 ? '1.5x' : '1x'}</Text>
                                            </Flex>
                                        </Flex>
                                            <Flex fontSize='14px' mb='.75rem' justify='space-between'>
                                                <Text w='4rem' color='limegreen'>#</Text>
                                                <Text w='9rem' color='limegreen'>ADDRESS</Text>
                                                <Text w='7rem' textAlign='center' color='limegreen'>POINTS</Text>
                                                <Text w='5rem' textAlign='center' color='limegreen'>MULTI</Text>
                                            </Flex>
                                        {leaderboards.slice(0,100).map((item, index) => {
                                        let multi = 1;
                                        let multiColor = 'white'
                                        if (index < 10) {
                                            multi = 3
                                            multiColor = '#FFD700'
                                        } else if (index < 25) {
                                            multi = 2.5
                                            multiColor = '#8A2BE2'
                                        } else if (index < 50) {
                                            multi = 2
                                            multiColor = '#68BBE3'
                                        } else if (index < 100) {
                                            multi = 1.5
                                            multiColor = '#FF69B4'
                                        }
                                            return(
                                                <Flex borderBottom='1px solid #202020' p='.75rem 0rem' fontSize='14px' key={leaderboards.indexOf(item)} justify='space-between'>
                                                    <Text w='4rem' textShadow={item.twitter === twitter ? '0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen, 0 0 12px limegreen' : null}>#{leaderboards.indexOf(item)+1}</Text>
                                                    <Text w='9rem' textShadow={item.twitter === twitter ? '0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen, 0 0 12px limegreen' : null}>{`${item.address?.slice(0,10)}...`}</Text>
                                                    <Text w='7rem' textAlign='center' textShadow={item.twitter === twitter ? '0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen, 0 0 12px limegreen' : null}>{item.points}</Text>
                                                    <Text w='5rem' textAlign='center' textShadow={item.twitter === twitter ? `0 0 1px ${multiColor}, 0 0 2px ${multiColor}, 0 0 5px ${multiColor}, 0 0 12px ${multiColor}` : null}color={multiColor}>{multi}x</Text>
                                                </Flex>
                                            )
                                        })}
                                    </ModalBody>
                                    <ModalFooter>
                                        <Button borderRadius='0px' onClick={handleCloseLeaderboard}>Close</Button>
                                    </ModalFooter>
                                    </ModalContent>
                                </Modal>
                            </MenuItem>
                        </MenuList>
                    </Menu>
                }
            </Flex>
            <Flex mt={isLargerThan600 ? '0px' : '3rem'} h={isLargerThan600 ? '84vh' : '75vh'} w={isLargerThan600 ? '100%': '120%'} justify='center' align='center' direction='column'>
                <Flex w={isLargerThan600 ? '25%': '80%'} align='center' justify='space-between'>
                    <Text w={isLargerThan600 ? '80%' : '55%'} pr='2rem'>Connect to Twitter to earn rewards</Text>
                    <Button _hover={{ backgroundColor: '#66ccff', color: 'white'}} bgColor='#1da1f2' borderRadius='none' onClick={() => {if (!session) {signIn('twitter')}}}>{session ? 'Connected' : 'Twitter'}</Button>
                </Flex>
                <Flex mt='2rem' w={isLargerThan600 ? '25%': '80%'} align='center' justify='space-between'>
                    <Text w='45%'>Enter your ETH address</Text>
                    <Input onChange={(e) => setAddress(e.target.value)} borderRadius='none' w='45%' placeholder="0x123" />
                </Flex>
                <Flex mt='1rem' w={isLargerThan600 ? '25%': '100%'} align='center' direction='column' justify='space-between'>
                    <Input onChange={(e) => setReferrer(e.target.value)} mt='1rem' borderRadius='none' w='40%' textAlign='center' placeholder='invite code'/>
                </Flex>
                <Flex justify='space-evenly' align='center' mt='3rem' w={isLargerThan600 ? '15%' : '80%'}>
                    <Button _hover={{ backgroundColor: 'lightgreen', color: 'black'}} borderRadius='none' color='black' bgColor='limegreen' onClick={() => postData()}>submit</Button>
                    <Button bgColor='black' border='1px solid limegreen' borderRadius='0' onClick={handleOpenHowTo}>How It Works</Button>
                    <Modal isOpen={isOpenHowTo} onClose={handleCloseHowTo}>
                        <ModalOverlay />
                        <ModalContent w='90%' h='70%' borderRadius='0%' bgColor='black' border='1px solid gray'>
                            <ModalBody bgColor='black' borderRadius='0px' border='1px solid gray'>
                                <Text>
                                    <Highlight query='social activity' styles={{ px: '1', bg: 'limegreen', color: 'black'}}>
                                        1) Connect to Twitter to earn your initial rewards. Rewards are based on social activity
                                    </Highlight>
                                </Text>
                                <Text  mt='1rem'>
                                    <Highlight query='airdrop' styles={{ px: '1', bg: 'limegreen', color: 'black'}}>
                                        2) Enter your ETH address. This is the address you will receive your airdrop.
                                    </Highlight>
                                </Text>
                                <Text mt='1rem'>
                                    <Highlight query='invite code' styles={{ px: '1', bg: 'limegreen', color: 'black'}}>
                                        3) Use an invite code if you have one!
                                    </Highlight>
                                </Text>
                                <Text mt='1rem'>
                                    <Highlight query='1.1x points' styles={{ px: '1', bg: 'limegreen', color: 'black'}}>
                                        You will be granted your own personal invite code after submission! Share with as many people as you can! Each invite will earn you 1.1x points
                                    </Highlight>
                                </Text>
                                <Text mt='1rem'>
                                    <Highlight query='additional multiplier' styles={{ px: '1', bg: 'limegreen', color: 'black'}}>
                                        Remember to check the Leaderboard! Moving up the leaderboard will grant you an additional multiplier reward on Airdrop Day
                                    </Highlight>
                                </Text>
                            </ModalBody>
                        </ModalContent>
                    </Modal>
                </Flex>
            </Flex>
            <Flex w={isLargerThan600 ? '100%' : '120%'} h='8vh' align='center' justify='space-evenly' direction='column'>
                <Text textAlign='center' w={isLargerThan600 ? '50%' : '90%'}>Users who interact with our social media may be rewarded</Text>
                <Flex w={isLargerThan600 ? '20%' : '90%'} pt={isLargerThan600 ? '' : '1rem'} justify='space-evenly'>
                    <Button fontSize='14px' borderRadius='0px' border='1px solid gray' bgColor='#000' color='white' onClick={() => window.open('https://twitter.com/GainCoinXYZ?s=20')}>Twitter</Button>
                    <Button fontSize='14px' borderRadius='0px' border='1px solid gray' bgColor='#000' color='white' onClick={() => window.open('https://t.me/GainCoinXYZ')}>Telegram</Button>
                </Flex>
            </Flex>
        </Flex>
    )
}