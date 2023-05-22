import React, { useState, useEffect } from 'react'
import { Text, Flex, Button, Input, useToast, Box } from "@chakra-ui/react"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
  } from '@chakra-ui/react'
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

    // Success & Error Toasts

    function successToast(message) {
        toast({
            position: 'top',
            render: () => (
                <Box textAlign='center' color='black' bgColor='limegreen' padding='1rem'>
                    {message}
                </Box>
            )
        })
    }

    function badToast(message) {
        toast({
            position: 'top',
            render: () => (
                <Box color='white' bgColor='red.600' padding='1rem'>
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

    async function getUserByCode() {
        try {
            const res = await fetch(`/api/addpoints?referralCode=${referrer}`, {
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
            getUserByCode()
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
        <Flex w='100%' h='100vh' bgColor='black' direction='column'>
            <Flex pl='10%' pr='10%' w='100%' justify='space-between' align='center' h='8vh'>
                <Text fontSize='30px' onClick={() => location.href='/'}>GAINCOIN</Text>
                <Flex w='20%'>
                    <Button mr='2rem' _hover={{ backgroundColor: 'limegreen', color: 'black' }} border='1px solid limegreen' borderRadius='0px' bgColor='black' onClick={() => getInviteCode()}>{currentUser ? currentUser.referralCode : 'invite code'}</Button>
                    <Popover>
                        <PopoverTrigger>
                            <Button _hover={{ backgroundColor: 'limegreen', color: 'black'}} border='1px solid limegreen' borderRadius='0px' bgColor='black' onClick={() => {getLeaderboard()}}>leaderboards</Button>
                        </PopoverTrigger>
                        <PopoverContent bgColor='black' borderRadius='0px' border='1px solid gray'>
                            <PopoverBody>
                                <Flex justify='space-between'>
                                    <Flex>
                                        <Text m='0rem 1rem' color='limegreen'>#</Text>
                                        <Text m='0rem 0.5rem' color='limegreen'>ADDRESS</Text>
                                    </Flex>
                                    <Text m='0rem 1rem' color='limegreen'>POINTS</Text>
                                </Flex>
                                {leaderboards.slice(0,10).map((item) => {
                                    return(
                                        <Flex m='1rem' key={leaderboards.indexOf(item)} justify='space-between'>
                                            <Flex>
                                                <Text textShadow={item.twitter === twitter ? '0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen' : null} mr='1rem' p='0px'>#{leaderboards.indexOf(item)+1}</Text>
                                                <Text textShadow={item.twitter === twitter ? '0 0 1px limegreen, 0 0 2px #fff, 0 0 5px limegreen' : null}>{`${item.address?.slice(0,10)}...`}</Text>
                                            </Flex>
                                            <Text textShadow={item.twitter === twitter ? '0 0 1px limegreen, 0 0 2px #fff, 0 0 5px limegreen' : null}>{item.points}</Text>
                                        </Flex>
                                    )
                                })}
                                {!leaderboards.slice(0,10).some(obj => obj['twitter'] === twitter) ? 
                                    <Flex m='2rem 1rem 1rem 1rem' justify='space-between'>
                                        <Flex>
                                            <Text textShadow='0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen' mr='1rem'>#{leaderboards.findIndex(obj => obj['twitter'] === twitter) + 1}</Text>
                                            <Text textShadow='0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen'>{currentUser?.address?.slice(0,10)}...</Text>
                                        </Flex>
                                        <Text textShadow='0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen'>{currentUser?.points}</Text>
                                    </Flex> : null
                                }
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
                </Flex>
            </Flex>
            <Flex h='84vh' w='100%' justify='center' align='center' direction='column'>
                <Flex w='25%' align='center' justify='space-between'>
                    <Text>Connect to Twitter to earn rewards</Text>
                    <Button _hover={{ backgroundColor: '#66ccff', color: 'white'}} bgColor='#1da1f2' borderRadius='none' onClick={() => {if (!session) {signIn('twitter')} else { signOut() }}}>Twitter</Button>
                </Flex>
                <Flex mt='2rem' w='25%' align='center' justify='space-between'>
                    <Text>Enter your ETH address</Text>
                    <Input onChange={(e) => setAddress(e.target.value)} borderRadius='none' w='50%' placeholder="0x123" />
                </Flex>
                <Button _hover={{ backgroundColor: 'lightgreen', color: 'black'}} mt='4rem' borderRadius='none' color='black' bgColor='limegreen' onClick={() => postData()}>submit</Button>
                <Flex mt='2rem' w='25%' align='center' direction='column' justify='space-between'>
                    <Input onChange={(e) => setReferrer(e.target.value)} mt='1rem' borderRadius='none' w='30%' textAlign='center' placeholder='invite code'/>
                </Flex>
            </Flex>
        </Flex>
    )
}