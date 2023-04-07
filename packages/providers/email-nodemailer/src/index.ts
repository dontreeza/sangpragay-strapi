import _ from 'lodash';
import nodemailer, { SendMailOptions } from 'nodemailer';
import type { Settings, SendOptions } from '@strapi/plugin-email';

type ProviderOptions = Parameters<typeof nodemailer.createTransport>[0];

const emailFields = [
  'from',
  'replyTo',
  'to',
  'cc',
  'bcc',
  'subject',
  'text',
  'html',
  'attachments',
];

export = {
  provider: 'nodemailer',
  name: 'Nodemailer',

  init(providerOptions: ProviderOptions, settings: Settings) {
    const transporter = nodemailer.createTransport(providerOptions);

    return {
      send(options: SendOptions) {
        // Default values.
        const emailOptions: SendMailOptions = {
          ..._.pick(options, emailFields),
          from: options.from || settings.defaultFrom,
          replyTo: options.replyTo || settings.defaultReplyTo,
          text: options.text || options.html,
          html: options.html || options.text,
        };

        return transporter.sendMail(emailOptions);
      },
    };
  },
};
