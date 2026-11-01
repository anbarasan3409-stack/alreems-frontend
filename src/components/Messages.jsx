import React, { useState } from 'react';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Plus, 
  Users, 
  Clock,
  Pin,
  Smile,
  Paperclip,
  MoreVertical,
  Online,
  PhoneCall,
  Video
} from 'lucide-react';
import { useStudentProfile } from '../hooks/useStudentAPI.js';

const Messages = ({ searchQuery }) => {
  const { profile } = useStudentProfile();
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'teachers', 'students', 'groups'

  // Mock data for conversations
  const conversations = [
    {
      id: 1,
      type: 'teacher',
      name: 'Dr. Sarah Johnson',
      role: 'Mathematics Teacher',
      avatar: '👩‍🏫',
      lastMessage: 'Great work on your assignment! Keep it up.',
      lastMessageTime: '2 min ago',
      unreadCount: 1,
      online: true,
      pinned: true
    },
    {
      id: 2,
      type: 'student',
      name: 'Alex Chen',
      role: 'Study Partner',
      avatar: '👨‍🎓',
      lastMessage: 'Want to study together for the physics exam?',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      online: true,
      pinned: false
    },
    {
      id: 3,
      type: 'group',
      name: 'Physics Study Group',
      role: '8 members',
      avatar: '📚',
      lastMessage: 'Emma: The assignment is due tomorrow!',
      lastMessageTime: '3 hours ago',
      unreadCount: 3,
      online: false,
      pinned: false
    },
    {
      id: 4,
      type: 'teacher',
      name: 'Prof. Michael Davis',
      role: 'Computer Science',
      avatar: '👨‍💻',
      lastMessage: 'Office hours are available this Friday.',
      lastMessageTime: '1 day ago',
      unreadCount: 0,
      online: false,
      pinned: false
    },
    {
      id: 5,
      type: 'student',
      name: 'Emma Wilson',
      role: 'Classmate',
      avatar: '👩‍🎓',
      lastMessage: 'Thanks for sharing your notes!',
      lastMessageTime: '2 days ago',
      unreadCount: 0,
      online: true,
      pinned: false
    }
  ];

  // Mock messages for selected chat
  const messages = selectedChat ? [
    {
      id: 1,
      senderId: selectedChat.id,
      senderName: selectedChat.name,
      content: selectedChat.lastMessage,
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      isMe: false
    },
    {
      id: 2,
      senderId: 'me',
      senderName: profile?.name || 'You',
      content: 'Thank you! I really appreciate your feedback.',
      timestamp: new Date(Date.now() - 60000), // 1 minute ago
      isMe: true
    }
  ] : [];

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery?.toLowerCase() || '');
    const matchesTab = activeTab === 'all' || 
                     (activeTab === 'teachers' && conv.type === 'teacher') ||
                     (activeTab === 'students' && conv.type === 'student') ||
                     (activeTab === 'groups' && conv.type === 'group');
    return matchesSearch && matchesTab;
  });

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      // Add new message to the conversation
      // In real app, this would send to API
      setNewMessage('');
    }
  };

  const getConversationIcon = (type) => {
    switch (type) {
      case 'teacher': return '👩‍🏫';
      case 'student': return '👨‍🎓';
      case 'group': return '👥';
      default: return '💬';
    }
  };

  const ConversationItem = ({ conversation }) => (
    <div
      onClick={() => setSelectedChat(conversation)}
      className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${
        selectedChat?.id === conversation.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
      }`}
    >
      {conversation.pinned && (
        <Pin size={12} className="absolute top-2 right-2 text-gray-400" />
      )}
      
      <div className="relative mr-3">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
          {conversation.avatar}
        </div>
        {conversation.online && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-medium text-gray-900 truncate">{conversation.name}</h3>
          <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
        </div>
        <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
        <p className="text-xs text-gray-400 mt-1">{conversation.role}</p>
      </div>
      
      {conversation.unreadCount > 0 && (
        <div className="ml-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {conversation.unreadCount}
        </div>
      )}
    </div>
  );

  const MessageBubble = ({ message }) => (
    <div className={`flex ${message.isMe ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        message.isMe 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-900'
      }`}>
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${
          message.isMe ? 'text-blue-100' : 'text-gray-500'
        }`}>
          {message.timestamp.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-200px)] bg-white rounded-lg border border-gray-100 overflow-hidden">
      <div className="flex h-full">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Plus size={20} className="text-gray-600" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'teachers', label: 'Teachers' },
                { id: 'students', label: 'Students' },
                { id: 'groups', label: 'Groups' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-1 px-3 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <MessageCircle size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map(conversation => (
                <ConversationItem key={conversation.id} conversation={conversation} />
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="relative mr-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-lg">
                        {selectedChat.avatar}
                      </div>
                      {selectedChat.online && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{selectedChat.name}</h3>
                      <p className="text-sm text-gray-500">
                        {selectedChat.online ? 'Online' : 'Last seen 2 hours ago'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <PhoneCall size={18} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <Video size={18} className="text-gray-600" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>Start a conversation with {selectedChat.name}</p>
                    </div>
                  </div>
                ) : (
                  messages.map(message => (
                    <MessageBubble key={message.id} message={message} />
                  ))
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Paperclip size={18} className="text-gray-600" />
                  </button>
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type a message..."
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors">
                      <Smile size={16} className="text-gray-600" />
                    </button>
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* No Chat Selected */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p>Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
