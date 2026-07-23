import type { DynamoDBStreamHandler } from 'aws-lambda'
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'

const ses = new SESv2Client()
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''
const FROM_EMAIL = process.env.FROM_EMAIL ?? ''
const SITE_URL = process.env.SITE_URL ?? 'https://estarfd.store'

type Img = Record<string, { S?: string; N?: string; BOOL?: boolean }> | undefined
const s = (img: Img, key: string) => img?.[key]?.S ?? ''

function esc(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
}

function kstNow() {
  return new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
}

// ── 홈페이지 디자인(화이트/잉크/클레이 e 로고)의 공용 이메일 셸 ──
function shell(inner: string) {
  return `<!doctype html><html lang="ko"><body style="margin:0;padding:0;background:#F6F5F2;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F5F2;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#FFFFFF;border:1px solid #E9E8E4;border-radius:12px;overflow:hidden;font-family:'Apple SD Gothic Neo','Malgun Gothic',Arial,sans-serif;">
<tr><td style="padding:26px 36px;border-bottom:1px solid #E9E8E4;">
  <span style="font-size:24px;font-weight:800;color:#B0542F;letter-spacing:-1px;">e</span><span style="font-size:20px;font-weight:800;color:#1C1C1A;letter-spacing:-0.5px;">스타필드</span>
  <span style="font-size:11px;color:#6E6E69;letter-spacing:2px;">&nbsp;공인중개사사무소</span>
</td></tr>
${inner}
<tr><td style="padding:22px 36px;background:#F6F5F2;border-top:1px solid #E9E8E4;font-size:12px;color:#6E6E69;line-height:1.8;">
  e스타필드 공인중개사사무소 · 대표(공인중개사) 이훈희<br/>
  경기도 하남시 하남유니온로 70-1, 110호 · 031-793-9500<br/>
  <a href="${SITE_URL}" style="color:#B0542F;text-decoration:none;">estarfd.store</a>
</td></tr>
</table>
</td></tr></table></body></html>`
}

function row(label: string, value: string) {
  return `<tr>
<td style="padding:12px 0;border-bottom:1px solid #F1F0ED;font-size:12px;color:#6E6E69;width:90px;vertical-align:top;">${label}</td>
<td style="padding:12px 0;border-bottom:1px solid #F1F0ED;font-size:14px;color:#1C1C1A;line-height:1.7;">${value}</td>
</tr>`
}

// 새 문의 → 관리자 알림
function adminNotification(img: Img) {
  const name = s(img, 'name')
  const inner = `<tr><td style="padding:32px 36px;">
  <h1 style="margin:0 0 6px;font-size:21px;font-weight:800;color:#1C1C1A;letter-spacing:-0.5px;">새 문의가 접수되었습니다</h1>
  <p style="margin:0 0 22px;font-size:13px;color:#6E6E69;">${kstNow()}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E9E8E4;">
    ${row('이름', esc(name))}
    ${row('이메일', esc(s(img, 'email')) || '-')}
    ${row('연락처', esc(s(img, 'phone')))}
    ${row('문의유형', esc(s(img, 'kind')) || '-')}
    ${row('내용', esc(s(img, 'message')))}
  </table>
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:26px;"><tr><td style="background:#1C1C1A;border-radius:6px;">
    <a href="${SITE_URL}/admin" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;">관리자에서 답변하기</a>
  </td></tr></table>
</td></tr>`
  return {
    subject: `[e스타필드] 새 문의: ${name}님`,
    html: shell(inner),
  }
}

// 회신 저장 → 문의자에게 답변 메일
function customerReply(img: Img) {
  const name = s(img, 'name')
  const inner = `<tr><td style="padding:32px 36px;">
  <h1 style="margin:0 0 18px;font-size:21px;font-weight:800;color:#1C1C1A;letter-spacing:-0.5px;">문의하신 내용에 대한 답변입니다</h1>
  <p style="margin:0 0 24px;font-size:14px;color:#3A3A37;line-height:1.8;">
    안녕하세요, ${esc(name)}님.<br/>e스타필드 공인중개사사무소입니다. 남겨주신 문의에 답변드립니다.
  </p>
  <p style="margin:0 0 8px;font-size:12px;color:#6E6E69;">문의하신 내용</p>
  <div style="border-left:3px solid #E9E8E4;padding:4px 0 4px 16px;margin:0 0 24px;font-size:13px;color:#6E6E69;line-height:1.8;">${esc(s(img, 'message'))}</div>
  <p style="margin:0 0 8px;font-size:12px;color:#B0542F;font-weight:700;">답변</p>
  <div style="background:#F6F5F2;border:1px solid #E9E8E4;border-radius:10px;padding:20px 22px;font-size:14px;color:#1C1C1A;line-height:1.9;">${esc(s(img, 'reply'))}</div>
  <p style="margin:26px 0 0;font-size:13px;color:#6E6E69;line-height:1.8;">
    추가 문의는 이 메일에 회신하시거나 <strong style="color:#1C1C1A;">031-793-9500</strong>으로 연락 주세요.<br/>감사합니다.
  </p>
</td></tr>`
  return {
    subject: `[e스타필드 공인중개사사무소] 문의하신 내용에 대한 답변입니다`,
    html: shell(inner),
  }
}

async function send(to: string, subject: string, html: string, replyTo?: string) {
  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: FROM_EMAIL,
      Destination: { ToAddresses: [to] },
      ReplyToAddresses: replyTo ? [replyTo] : undefined,
      Content: {
        Simple: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: { Html: { Data: html, Charset: 'UTF-8' } },
        },
      },
    }),
  )
}

export const handler: DynamoDBStreamHandler = async (event) => {
  for (const record of event.Records) {
    try {
      const newImg = record.dynamodb?.NewImage as Img
      const oldImg = record.dynamodb?.OldImage as Img

      if (record.eventName === 'INSERT' && newImg) {
        // 새 문의 → 관리자 알림 (문의자 이메일이 있으면 바로 회신 가능하도록 Reply-To 설정)
        const mail = adminNotification(newImg)
        const customerEmail = s(newImg, 'email')
        await send(ADMIN_EMAIL, mail.subject, mail.html, customerEmail || undefined)
        console.log(`[notify] 관리자 알림 발송: ${s(newImg, 'name')}`)
      } else if (record.eventName === 'MODIFY' && newImg) {
        // 회신이 새로 저장/갱신된 경우에만 문의자에게 발송
        const newReply = s(newImg, 'reply')
        const replyChanged = newReply && newReply !== s(oldImg, 'reply')
        const customerEmail = s(newImg, 'email')
        if (replyChanged && customerEmail) {
          const mail = customerReply(newImg)
          await send(customerEmail, mail.subject, mail.html, ADMIN_EMAIL)
          console.log(`[notify] 답변 메일 발송: ${customerEmail}`)
        }
      }
    } catch (err) {
      console.error('[notify] 메일 발송 실패:', err)
    }
  }
}
