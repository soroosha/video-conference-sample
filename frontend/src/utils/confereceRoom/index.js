import settings from "../../constants/settings" 

export default class ConferenceRoom {
  static createPeerConnection(mediaStream){
    let connection = new RTCPeerConnection()
    mediaStream.getTracks().forEach(track => {
      connection.addTrack(track, mediaStream)
    })
    return connection
  }

  constructor (room, mediaStream, options={}){
    // TODO - room/mediaStream validation
    this.room = room
    this.media_stream = mediaStream
    this.options = options
    this.peer_offers = []
    this.peer_answers = []
    this.peers = []

    this.connection_offer_options = {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    }

    this.joinRoom()
  }

  getPeerSDP(peer_id){
    return this.peer_offers.find(po => po.peer !== peer_id) || this.peer_answers.find(pa => pa.peer !== peer_id)
  }
  removePeer(peer_id){
    this.peer_offers = this.peer_offers.filter(po => po.peer !== peer_id)
    this.peer_answers = this.peer_answers.filter(pa => pa.peer !== peer_id)
    this.peers = this.peers.filter(peer => peer.id !== peer_id)
  }
  joinRoom(){
    this.socket = new WebSocket(`ws://${settings.BACKEND.HOST}/ws/conference/room/${this.room.id}/`)
    this.socket.onopen = this.onSocketOpen.bind(this)
    this.socket.onmessage = this.onSocketMessage.bind(this)
    this.socket.onerror = this.onSocketError.bind(this)
    this.socket.onclose = ()=>{
      console.log(`room ${this.room.name} websocket closed`)
    }
  }

  leaveRoom(){
    const closeConnection = p => {
      p.connection.close()
    }
    this.peer_offers.forEach(closeConnection)
    this.peer_answers.forEach(closeConnection)
    this.peers.forEach(closeConnection)
    this.socket.close()
  }

  onSocketOpen(){
    if(this.options.onJoin){
      this.options.onJoin()
    }
  }
  onSocketError(error){
    if(this.options.onError){
      this.options.onError(error)
    }
    console.log('Retrying server connection...')
    clearTimeout(this.retry_timeout)
    this.retry_timeout = setTimeout(()=>{
      this.joinRoom()
    },3000)
  }
  async onSocketMessage(message){
    let data = JSON.parse(message.data)

    // 1) Peer A: RECEIVE REQUEST TO SEND OFFER TO PEER B
    if(data.action==='SEND_OFFER'){
      console.log('SEND_OFFER')
      const connection = ConferenceRoom.createPeerConnection(this.media_stream)
      connection.addEventListener('icecandidate', event => {
        // SEND ICE CANDIDATE TO PEER B
        this.socket.send(JSON.stringify({
          action: 'SEND_ICE_CANDIDATE',
          ice_candidate: JSON.stringify(event.candidate),
          to_peer: data.to_peer
        }))
      })
      connection.addEventListener('track', event=>{
        console.log('Got track')
        // 4) create peer and add track (ice candidates will keep coming as needed)
        this.removePeer(data.to_peer)
        this.peers.push({
          id: data.to_peer,
          mediaStream: event.streams[0],
          connection
        })
        this.options.onPeersUpdate(this.peers)
      })

      const offer = await connection.createOffer(this.connection_offer_options)
      await connection.setLocalDescription(offer)
      
      this.peer_offers = this.peer_offers.filter(po => po.peer!==data.to_peer)
      this.peer_offers.push({
        peer:data.to_peer,
        offer,
        connection
      })

      this.socket.send(JSON.stringify({
        action: 'OFFER',
        offer: JSON.stringify(offer),
        to_peer: data.to_peer
      }))
    }

    // 2) Peer B: DID RECEIVE OFFER FROM PEER A
    if(data.action==='DID_RECEIVE_OFFER'){
      console.log('DID_RECEIVE_OFFER')
      const connection = ConferenceRoom.createPeerConnection(this.media_stream)
      connection.addEventListener('icecandidate', event => {
        // this step may happen before or after answer/offer is received
        this.socket.send(JSON.stringify({
          action: 'SEND_ICE_CANDIDATE',
          ice_candidate: JSON.stringify(event.candidate),
          to_peer: data.from_peer
        }))
      })
      connection.addEventListener('track', event=>{
        // 4) create peer and add track (ice candidates will keep coming as needed)
        this.removePeer(data.from_peer)
        this.peers.push({
          id: data.from_peer,
          mediaStream: event.streams[0],
          connection
        })
        this.options.onPeersUpdate(this.peers)
      })

      await connection.setRemoteDescription(JSON.parse(data.offer))
      const answer = await connection.createAnswer(this.connection_offer_options)
      await connection.setLocalDescription(answer)
      
      this.peer_answers = this.peer_answers.filter(pa => pa.peer!==data.from_peer)
      this.peer_answers.push({
        peer:data.from_peer,
        answer,
        connection
      })

      this.socket.send(JSON.stringify({
        action: 'ANSWER',
        answer: JSON.stringify(answer),
        to_peer: data.from_peer
      }))
    }

    // 3) Peer A: DID RECEIVE ANSWER FROM PEER B
    if(data.action==='DID_RECEIVE_ANSWER'){
      console.log('DID_RECEIVE_ANSWER')
      let peer_offer = this.peer_offers.find(po => po.peer === data.from_peer)
      await peer_offer.connection.setRemoteDescription(JSON.parse(data.answer))
    }

    // ICE - repeated) Peer A and B: RECEIVE ICE_CANDIDATE FROM OTHER PEER
    if(data.action==='DID_RECEIVE_ICE_CANDIDATE'){
      console.log('DID_RECEIVE_ICE_CANDIDATE')
      // console.log(`received ICE candidate from ${data.from_peer}`)
      let peer = this.peers.find(peer => peer.id === data.from_peer) || this.getPeerSDP(data.from_peer)
      if(peer){
        const ice_candidate = JSON.parse(data.ice_candidate)
        peer.connection.addIceCandidate(ice_candidate).catch((err)=>{
          console.error(ice_candidate, err)
        })
      }
    }

    if(data.action==='REMOVE_PEER'){
      console.log('REMOVE_PEER')
      // close peer connection and remove from conference room
      let is_peers_changed = false
      let peer = this.peers.find(peer => peer.id === data.peer)
      if(peer){
        is_peers_changed = true
        peer.connection.close()
      }
      peer = this.peer_offers.find(po => po.peer === data.peer)
      if(peer) peer.connection.close()
      peer = this.peer_answers.find(pa => pa.peer === data.peer)
      if(peer) peer.connection.close()
      this.peers = this.peers.filter(peer => peer.id !== data.peer)
      this.peer_offers = this.peer_offers.filter(po => po.id !== data.peer)
      this.peer_answers = this.peer_answers.filter(pa => pa.id !== data.peer)

      if(is_peers_changed){
        // call update only if peer connection was already established
        // otherwise, only offer/answer is removed 
        this.options.onPeersUpdate(this.peers)
      }
    }
  }
}