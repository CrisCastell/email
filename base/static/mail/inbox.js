document.addEventListener('DOMContentLoaded', function() {
  


  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#compose').addEventListener('click', () => compose_email(''));

  let emailForm = document.querySelector('#compose-form');
  emailForm.addEventListener('submit', function(e){
      e.preventDefault();
      sendEmail(emailForm);
  })

  
  // By default, load the inbox
  load_mailbox('inbox');
});

function getToken(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i].trim();
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
}
function compose_email(email_address) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#single-email-view').style.display = 'none';
  document.querySelector('#message-box').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = email_address;
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';
  document.querySelector('#message-box').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      createEmailList(emails)
  })
  .catch(error => console.log(error));
}





function createEmailList(emails) {
  //Select the emails-view
  const email_inbox = document.querySelector('#emails-view')

  //create email bars with information about the email
  if(emails.length < 1){
    const noEmails = document.createElement('h5');
    noEmails.innerHTML = "No emails yet"
    email_inbox.appendChild(noEmails);
    return
  }
  emails.forEach(function(email) {
    const email_bar = document.createElement('div')

    const sender_container = document.createElement('div')
    const sender = document.createElement('p')
    const body_container = document.createElement('div')
    const body = document.createElement('p')
    const timestamp_container = document.createElement('div')
    const timestamp = document.createElement('p')
    
    email_bar.className ='rounded'
    email_bar.classList.add('email_bar')
    sender_container.className = 'sender'
    body_container.className = 'body'
    timestamp_container.className = 'time'

    sender.append(email.sender)
    timestamp.append(email.timestamp)
    body.append(email.subject)

    sender_container.appendChild(sender)
    body_container.appendChild(body)
    timestamp_container.appendChild(timestamp)

    email_bar.appendChild(sender)
    email_bar.appendChild(body_container)
    email_bar.appendChild(timestamp_container)


    email_bar.addEventListener('click', () => {
      loadEmail(email.id)
    })
    

    email_inbox.appendChild(email_bar);

  })
  
}

function loadEmail(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    showEmail(email);
  })
  .catch(error => console.log(error));
}

function showEmail(email) {
  const email_view = document.querySelector('#single-email-view');

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  email_view.style.display = 'block';

  document.querySelector('#sender-data').innerHTML = email.sender;
  document.querySelector('#recipient-data').innerHTML = email.recipients;
  document.querySelector('#subject-data').innerHTML = email.subject;
  document.querySelector('#timestamp-data').innerHTML = email.timestamp;
  document.querySelector('#email-body').innerHTML = email.body;


  
  document.querySelector('#reply-button').addEventListener('click', function() {
    compose_email(email.sender)
  });
}

function sendEmail(email) {
  const message = document.querySelector('#message-compose');
  const csrftoken = getToken('csrftoken');
  const data = new FormData(email);

  fetch('/emails', {
    method: 'POST',
    headers:{
      'Content-Type': 'application/json',
      'X-CSRFToken':csrftoken
    },
    body: JSON.stringify({
      'recipients':data.get('recipients'),
      'subject':data.get('subject'),
      'body':data.get('body')
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    if(result.message != undefined){
      message.className = 'alert-success';
      message.innerHTML = result.message;
      setTimeout(function(){
        location.reload();
      },1000)
    }
    else{
      message.className = 'alert-warning';
      message.innerHTML = result.error;
    }
    
  })
  .catch(error => {
    console.log(error)
    message.className = 'alert-warning';
    message.innerHTML = error;
    message.style.display = 'block';

  });
}