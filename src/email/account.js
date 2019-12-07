const sgMail=require('@sendgrid/mail')
const sendgridAPIKey=''
sgMail.setApiKey(process.env.SEND_API_KEY)
const sendWelcomeEmail=(email,name)=>{
    console.log(email)
    sgMail.send({
        to:email,
        from:'loki.venkat98@gmail.com',
        subject:'Welcome to the task-manager app',
        text:`Hi ${name} , Thank you for installing the task-manager app`
    })   
} 
const sendCancelationEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'loki.venkat98@gmail.com',
        subject:'Thanks for using the task-manager app',
        text:`Hi ${name} ,Can you please tell us how we can improve our app,task-manager app`
    }) 

}
module.exports={
    sendWelcomeEmail,
    sendCancelationEmail
}