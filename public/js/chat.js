

const socket=io();



//Element
const $messageform=document.querySelector('#message-form');
const $messageformInput=document.querySelector('input');
const $messageformButton= document.querySelector('button');
const $locationButton=document.querySelector('#my-location');
const $messages=document.querySelector('#messages');

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML;
const locationTemplate=document.querySelector('#location-template').innerHTML;
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML;

//options


const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get('username'); // johnny
const room = urlParams.get('room');


const autoScroll=()=>{
     // New message element
     const $newMessage = $messages.lastElementChild

     // Height of the new message
     const newMessageStyles = getComputedStyle($newMessage)
     const newMessageMargin = parseInt(newMessageStyles.marginBottom)
     const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
 
     // Visible height
     const visibleHeight = $messages.offsetHeight
 
     // Height of messages container
     const containerHeight = $messages.scrollHeight
 
     // How far have I scrolled?
     const scrollOffset = $messages.scrollTop + visibleHeight
 
     if (containerHeight - newMessageHeight <= scrollOffset) {
         $messages.scrollTop = $messages.scrollHeight
     }
}


socket.on('message',(message)=>{
    console.log(message);
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
})

socket.on('LocationMessage',(message)=>{
    console.log(message);
    
    const html=Mustache.render(locationTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll()
})


socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageform.addEventListener('submit',(e)=>{
    e.preventDefault();

    $messageformButton.setAttribute('disabled','disabled');


    const message=e.target.elements.message.value;
    
    socket.emit('sendMessage',(message),(error)=>{
        $messageformButton.removeAttribute('disabled');
         $messageformInput.value='';
         $messageformInput.focus(); //make cursor at the input only
        if(error){
            return console.log(error);
        }
            
        console.log('Message Delivered !!');
        
    });

})


$locationButton.addEventListener('click',()=>{
    
    
    if(!navigator.geolocation){
        return alert('Geolocation is not supported in the browser !');
    }
    $locationButton.setAttribute('disabled','disabled');
    navigator.geolocation.getCurrentPosition((position)=>{
        
        socket.emit('sendLocation',({
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }),
        ()=>{
            $locationButton.removeAttribute('disabled');
            console.log('Location Shared !!');
        },
        )
    })
   
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error +'😒');
        location='/'
    }
})


