require('dotenv').config({path:'.env.local'});
const { Resend } = require('resend');

async function test() {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const r = await resend.emails.send({
      from: 'AI Job God <noreply@sahilmane.in>',
      to: 'sahil@example.com',
      subject: 'Test',
      html: '<p>Test</p>'
    });
    console.log(JSON.stringify(r, null, 2));
  } catch(e) {
    console.error("ERROR", e);
  }
}
test();
