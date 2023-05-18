import React, { useState, useEffect } from 'react'
import { Text, Flex, Button, Input, useToast, Box } from "@chakra-ui/react"
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
  } from '@chakra-ui/react'
  import { useSession, signIn, signOut } from 'next-auth/react'

export default function Airdrop() {
    const { data: session } = useSession()
    const toast = useToast()
    const addressPattern = /^(0x)?[0-9a-fA-F]{40}$/
    const [address, setAddress] = useState('')
    const [points, setPoints] = useState(1000)
    const [referralCode, setReferralCode] = useState('000002')
    const [twitter, setTwitter] = useState('')
    const [leaderboards, setLeaderboards] = useState([])
    const [userRank, setUserRank] = useState()

    console.log(session)
    console.log(twitter, address, points, referralCode)

    useEffect(() => {
        if (session) {
            setPoints((session.twitter.followersCount*10) + session.twitter.likesCount*10 + session.twitter.tweetsCount*10)
            setTwitter(session.twitter.twitterHandle)
        }
    }, [session])

    function successToast() {
        toast({
            position: 'top',
            render: () => (
                <Box textAlign='center' color='black' bgColor='limegreen' padding='1rem'>
                    Airdrop Confirmed
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

    async function postData() {
        let validAddress = addressPattern.test(address)
        if (validAddress) {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: {
                  "Content-type": "application/json",
                },
                body: JSON.stringify({
                  address: address,
                  points: points,
                  referralCode: referralCode,
                  twitter: twitter
                }),
              });
            
              const json = await res.json();
      
              if (res.ok) {
                  successToast();
              } else {
                  badToast(json.error);
              }
        } else {
            badToast('Invalid ETH Address')
        }
    }

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

    async function getCurrentUserRank() {
        const res = await fetch(`/api/users?twitter=${twitter}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })

        const json = await res.json()
        setUserRank(json)
    }

    return (
        <Flex w='100%' h='100vh' bgColor='black' direction='column'>
            <Flex pl='10%' pr='10%' w='100%' justify='space-between' align='center' h='8vh'>
                <Text fontSize='30px' onClick={() => location.href='/'}>GAINCOIN</Text>
                <Flex w='20%'>
                    <Button mr='2rem' _hover={{ backgroundColor: 'limegreen', color: 'black'}} border='1px solid limegreen' borderRadius='0px' bgColor='black'>referral code</Button>
                    <Popover>
                        <PopoverTrigger>
                            <Button _hover={{ backgroundColor: 'limegreen', color: 'black'}} border='1px solid limegreen' borderRadius='0px' bgColor='black' onClick={() => {getLeaderboard(), getCurrentUserRank()}}>leaderboards</Button>
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
                                {leaderboards.slice(0,3).map((item) => {
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
                                {!leaderboards.slice(0,3).some(obj => obj['twitter'] === twitter) ? 
                                    <Flex m='2rem 1rem 1rem 1rem' justify='space-between'>
                                        <Flex>
                                            <Text textShadow='0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen' mr='1rem'>#{leaderboards.findIndex(obj => obj['twitter'] === twitter) + 1}</Text>
                                            <Text textShadow='0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen'>{userRank?.address.slice(0,10)}...</Text>
                                        </Flex>
                                        <Text textShadow='0 0 1px limegreen, 0 0 2px limegreen, 0 0 5px limegreen'>{userRank?.points}</Text>
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
                    <Button _hover={{ backgroundColor: 'white', color: '#1da1f2'}} bgColor='#1da1f2' borderRadius='none' onClick={() => {if (!session) {signIn('twitter')} else { signOut() }}}>Twitter</Button>
                </Flex>
                <Flex mt='2rem' w='25%' align='center' justify='space-between'>
                    <Text>Enter your ETH address</Text>
                    <Input onChange={(e) => setAddress(e.target.value)} borderRadius='none' w='50%' placeholder="0x123" />
                </Flex>
                <Button _hover={{ backgroundColor: 'limegreen', color: 'black'}} mt='4rem' borderRadius='none' bgColor='black' border='1px solid limegreen' onClick={() => postData()}>submit</Button>
            </Flex>
        </Flex>
    )
}