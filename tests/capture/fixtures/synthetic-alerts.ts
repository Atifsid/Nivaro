import type { ParsedAlert, RawAlert } from '@/capture/types';

const T = Date.UTC(2026, 9, 31, 6, 30);

type Case = { name: string; raw: RawAlert; expected: ParsedAlert | null };

const sms = (sender: string, text: string): RawAlert => ({ source: 'sms', sender, text, receivedAt: T });
const notif = (sender: string, title: string, text: string): RawAlert => ({
  source: 'notification',
  sender,
  title,
  text,
  receivedAt: T,
});

const debit = (p: Partial<ParsedAlert>): ParsedAlert => ({
  amountPaise: 0,
  direction: 'debit',
  merchant: null,
  instrument: null,
  bank: null,
  ref: null,
  occurredAt: T,
  ...p,
});
const credit = (p: Partial<ParsedAlert>): ParsedAlert => debit({ direction: 'credit', ...p });

export const cases: Case[] = [
  {
    name: 'HDFC UPI debit',
    raw: sms('VM-HDFCBK', 'Rs.412.00 debited from A/c XX1234 to VPA swiggy@icici on 31-10-26. UPI Ref 498765432109. Not you? Call 18002586161'),
    expected: debit({ amountPaise: 41200, merchant: 'Swiggy', instrument: 'XX1234', bank: 'HDFC', ref: '498765432109' }),
  },
  {
    name: 'HDFC card spend',
    raw: sms('AD-HDFCBK', 'Spent Rs 1,299.50 on HDFC Bank Card x4821 at AMAZON PAY INDIA PRIVATE LIMITED on 2026-10-31:12:01:22'),
    expected: debit({ amountPaise: 129950, merchant: 'Amazon Pay', instrument: 'XX4821', bank: 'HDFC' }),
  },
  {
    name: 'ICICI account debit',
    raw: sms('JD-ICICIB', 'ICICI Bank Acct XX567 debited for Rs 249.00 on 31-Oct-26; BLINKIT credited. UPI:530912345678. Call 18002662 for dispute.'),
    expected: debit({ amountPaise: 24900, merchant: 'Blinkit', instrument: 'XX567', bank: 'ICICI', ref: '530912345678' }),
  },
  {
    name: 'SBI UPI debit',
    raw: sms('BZ-SBIUPI', 'Dear UPI user A/C X9876 debited by 186.0 on date 31Oct26 trf to UBER INDIA Refno 430198765432. If not u? call 1800111109. -SBI'),
    expected: debit({ amountPaise: 18600, merchant: 'Uber', instrument: 'XX9876', bank: 'SBI', ref: '430198765432' }),
  },
  {
    name: 'Axis card purchase',
    raw: sms('VK-AXISBK', 'INR 599.00 spent on Axis Bank Card no. XX3311 at AIRTEL on 31-10-26. Avl Lmt INR 85,401.00'),
    expected: debit({ amountPaise: 59900, merchant: 'Airtel', instrument: 'XX3311', bank: 'Axis' }),
  },
  {
    name: 'Kotak UPI sent',
    raw: sms('AX-KOTAKB', 'Sent Rs.320.00 from Kotak Bank AC X4455 to zomato@hdfcbank on 31-10-26.UPI Ref 712398765412. Not you, https://kotak.com/fraud'),
    expected: debit({ amountPaise: 32000, merchant: 'Zomato', instrument: 'XX4455', bank: 'Kotak', ref: '712398765412' }),
  },
  {
    name: 'Hindi debit',
    raw: sms('VM-SBIINB', 'आपके खाते XX9876 से ₹500 डेबिट किए गए, BIGBASKET को। UPI Ref 430111122223'),
    expected: debit({ amountPaise: 50000, merchant: 'Bigbasket', instrument: 'XX9876', bank: 'SBI', ref: '430111122223' }),
  },
  {
    name: 'Salary credit',
    raw: sms('VM-HDFCBK', 'Update! INR 82,000.00 credited to HDFC Bank A/c XX1234 on 31-OCT-26 for NEFT Cr-ACME SOFTWARE PVT LTD. Avl bal INR 1,02,345.00'),
    expected: credit({ amountPaise: 8200000, instrument: 'XX1234', bank: 'HDFC' }),
  },
  {
    name: 'Refund credit',
    raw: sms('JD-ICICIB', 'Your refund of Rs 249.00 from BLINKIT has been credited to ICICI Bank Acct XX567 on 31-Oct-26.'),
    expected: credit({ amountPaise: 24900, merchant: 'Blinkit', instrument: 'XX567', bank: 'ICICI' }),
  },
  {
    name: 'GPay paid notification',
    raw: notif('com.google.android.apps.nbu.paisa.user', 'Google Pay', 'Paid ₹500 to Blinkit'),
    expected: debit({ amountPaise: 50000, merchant: 'Blinkit' }),
  },
  {
    name: 'PhonePe notification',
    raw: notif('com.phonepe.app', 'Payment Successful', '₹186 paid to UBER INDIA SYSTEMS PVT LTD'),
    expected: debit({ amountPaise: 18600, merchant: 'Uber Systems' }),
  },
  {
    name: 'Paytm received notification',
    raw: notif('net.one97.paytm', 'Money Received', 'Received ₹1,000 from Rahul Sharma'),
    expected: credit({ amountPaise: 100000, merchant: 'Rahul Sharma' }),
  },
  {
    name: 'Gmail card alert notification',
    raw: notif('com.google.android.gm', 'Alert: Transaction on your credit card', 'Rs. 2,499.00 spent on your ICICI Bank Credit Card XX7788 at MYNTRA on 31-Oct-26'),
    expected: debit({ amountPaise: 249900, merchant: 'Myntra', instrument: 'XX7788', bank: 'ICICI' }),
  },
  {
    name: 'OTP with amount',
    raw: sms('VM-HDFCBK', '123456 is your OTP for txn of Rs 2,499.00 at MYNTRA on HDFC Bank card XX4821. Do not share it with anyone.'),
    expected: null,
  },
  {
    name: 'Balance only',
    raw: sms('JD-ICICIB', 'Avl Bal in ICICI Bank Acct XX567 is Rs 12,345.67 as on 31-Oct-26.'),
    expected: null,
  },
  {
    name: 'Loan promo',
    raw: sms('VM-HDFCBK', 'Get a pre-approved loan of Rs 5,00,000 instantly! Apply now on HDFC Bank app.'),
    expected: null,
  },
  {
    name: 'Cashback offer',
    raw: notif('net.one97.paytm', 'Offer for you', 'Get cashback upto ₹100 on your next recharge'),
    expected: null,
  },
  {
    name: 'Personal text',
    raw: sms('+919876543210', 'Paid you back Rs 200 for lunch'),
    expected: null,
  },
  {
    name: 'Unknown app notification',
    raw: notif('com.whatsapp', 'Mom', 'Paid ₹500 to the milkman'),
    expected: null,
  },
  {
    name: 'Amount without decimals or commas',
    raw: sms('VM-KOTAKB', 'Rs 75 debited from Kotak Bank AC X4455 to chaiwala@ybl. UPI Ref 712300001111'),
    expected: debit({ amountPaise: 7500, merchant: 'Chaiwala', instrument: 'XX4455', bank: 'Kotak', ref: '712300001111' }),
  },
];
