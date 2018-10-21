import React from 'react'
import ChatKit from '@pusher/chatkit'
import MessageList from './components/MessageList'
import SendMessageForm from './components/SendMessageForm'
import TypingIndicator from './components/TypingIndicator'
import WhosOnlineList from './components/WhosOnelineList'

class ChatScreen extends Component {
    constructor(props){
        super(props)
        this.state = {
            currentUser: {},
            currentRoom: {},
            messages: [],
            usersWhoAreTyping: [],
        }

        this.sendMessage = this.sendMessage.bind(this)
        this.sendTypingEvent = this.send.bind(this)
    }

    sendTypingEvent(){
        this.state.currentUser
            .isTypingIn({roomId: this.state.currentRoom.id})
            .catch(error => console.error('error', error))
    }

    sendMessage(text){
        this.state.currentUser.sendMessage({
            text, roomId: this.state.currentRoom.id,
        })
    }

    componentDidMount() {
        const chatManager = new Chatkit.ChatManager({
          instanceLocator: 'v1:us1:51b5421b-832b-4003-a1c5-411fb39025fc',
          userId: this.props.currentUsername,
          tokenProvider: new Chatkit.TokenProvider({
            url: 'http://localhost:3001/authenticate',
          }),
        })
    
        chatManager
          .connect()
          .then(currentUser => {
            this.setState({ currentUser })
            return currentUser.subscribeToRoom({
              roomId: 5985621,
              messageLimit: 100,
              hooks: {
                onNewMessage: message => {
                  this.setState({
                    messages: [...this.state.messages, message],
                  })
                },
                onUserStartedTyping: user => {
                  this.setState({
                    usersWhoAreTyping: [...this.state.usersWhoAreTyping, user.name],
                  })
                },
                onUserStoppedTyping: user => {
                  this.setState({
                    usersWhoAreTyping: this.state.usersWhoAreTyping.filter(
                      username => username !== user.name
                    ),
                  })
                },
                onUserCameOnline: () => this.forceUpdate(),
                onUserWentOffline: () => this.forceUpdate(),
                onUserJoined: () => this.forceUpdate(),
              },
            })
          })
          .then(currentRoom => {
            this.setState({ currentRoom })
          })
          .catch(error => console.error('error', error))
      }
    
      render() {
        const styles = {
          container: {
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
          },
          chatContainer: {
            display: 'flex',
            flex: 1,
          },
          whosOnlineListContainer: {
            width: '15%',
            padding: 20,
            backgroundColor: '#2c303b',
            color: 'white',
          },
          chatListContainer: {
            padding: 20,
            width: '85%',
            display: 'flex',
            flexDirection: 'column',
          },
        }
        return (
          <div style={styles.container}>
            <div style={styles.chatContainer}>
              <aside style={styles.whosOnlineListContainer}>
                <WhosOnlineList
                  currentUser={this.state.currentUser}
                  users={this.state.currentRoom.users}
                />
              </aside>
              <section style={styles.chatListContainer}>
                <MessagesList messages={this.state.messages} />
                <TypingIndicator usersWhoAreTyping={this.state.usersWhoAreTyping} />
                <SendMessageForm
                  onSubmit={this.sendMessage}
                  onChange={this.sendTypingEvent}
                />
              </section>
            </div>
          </div>
        )
      }
    }
    

export default ChatScreen