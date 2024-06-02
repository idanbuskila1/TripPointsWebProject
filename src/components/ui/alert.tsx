import { HistoricAlert } from "@/types/Trip";
import { Button as ButtonCH, useDisclosure, Box as Boxx, CloseButton, Alert as AlertCH, AlertIcon as AlertIconCH, AlertTitle as AlertTitleCH, AlertDescription } from '@chakra-ui/react'
import { useEffect, useState } from "react";

export const translateThreat = (threat: number) => {
    if (threat === 0) return "!צבע אדום";
    if (threat === 5) return "!חדירת כלי טיס עוין";
    return "!צבע אדום";
  };

export const timeToDate = (time: number) => {
    const date = new Date(0);
    date.setUTCSeconds(time);
    return date.toLocaleDateString('he-IL');
  }

  export const timeFromDate = (time: number) => {
    const date = new Date(0);
    date.setUTCSeconds(time);
    return date.toLocaleTimeString('he-IL');
  }
  
export function AlertOerf() {
  const {
    isOpen: isVisible,
    onClose,
    onOpen,
  } = useDisclosure({ defaultIsOpen: true })
  const [orefAlret, setOrefAlret] = useState<HistoricAlert>();

  useEffect(() => {
    //real time alerts api: https://red-alert-server.vercel.app/realtime
    fetch('https://red-alert-server.vercel.app/history', {
      //mode: 'no-cors',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
    }
    })
      .then((res) => {
        //console.log(res);
        return res.json();
      })
      .then((data) => {
        console.log(data['0'].alerts['0']);
        setOrefAlret(data['0'].alerts['0']);
      });
  }, []);
  return isVisible ? (
    <AlertCH
    //paddingX="25px"
    //paddingY="25px"
    display="flex"
    //float="right"
    bg="#ffc0cb"
    variant='solid'
    boxShadow='1g'
    //flexDirection='column'
    alignItems='center'
    justifyContent='center'
    textAlign='center'
    //height='10px'
    maxHeight='1%'
    //w="30%"
    maxWidth="400px"
    //ml={600}
    marginX="auto"
    borderRadius="5px"
    status='error'>
      <AlertIconCH display="visible" color='red' boxSize='27px'  />
      <Boxx w="52%" bg="#ffc0cb" ml="18%" >{ orefAlret &&  (
        <><AlertTitleCH color="red" fontWeight="extrabold" fontSize='10g'>{translateThreat(orefAlret.threat)} </AlertTitleCH><AlertTitleCH color="red" fontWeight="extrabold" fontSize='10g'>{timeToDate(orefAlret.time)} {timeFromDate(orefAlret.time)} </AlertTitleCH></>)}
        { orefAlret &&  (
        <AlertDescription maxWidth='sm'>
          אזור: {  }
          {(orefAlret.cities).toString()}
        </AlertDescription>)}
      </Boxx>
      <CloseButton
        alignSelf='flex-start'
        position='relative'
        ml="10%"
        //right={-60}
        top={5}
        onClick={onClose}
      />
    </AlertCH>
  ) : (
    <Boxx w="100%" height='30px' alignItems='center' justifyContent='center'>
       <ButtonCH float="right" borderRadius="5px" bg="red" onClick={onOpen}> !התרעה </ButtonCH>
    </Boxx>
  )
}