import { motion } from 'framer-motion'

const MailChimpSignUp = () => {
  return (
    <div id="mc_embed_signup">
      <form
        action="https://world.us12.list-manage.com/subscribe/post?u=5381817b945cf1d237f219562&id=9366de9b6a&f_id=003eb7e0f0"
        method="post"
        id="mc-embedded-subscribe-form"
        name="mc-embedded-subscribe-form"
        className="validate p-12 mx-auto max-w-lg"
        target="_self"
      >
        <div id="mc_embed_signup_scroll">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl mb-2">
            Join the mailing list
          </h2>
          <div className="mc-field-group space-x-2">
            <label htmlFor="mce-EMAIL" className="sr-only">
              Email Address
            </label>
            <input
              type="email"
              defaultValue=""
              name="EMAIL"
              className="required email bg-transparent border-2 border-white text-white p-2 min-w-[200px] text-center w-full"
              id="mce-EMAIL"
              required=""
              placeholder="Email address"
            />
            <span id="mce-EMAIL-HELPERTEXT" className="helper_text" />
          </div>
          <div id="mce-responses" className="clear foot">
            <div
              className="response"
              id="mce-error-response"
              style={{ display: 'none' }}
            />
            <div
              className="response"
              id="mce-success-response"
              style={{ display: 'none' }}
            />
          </div>{' '}
          {/* real people should not fill this in and expect good things - do not remove this or risk form bot signups*/}
          <div
            style={{ position: 'absolute', left: '-5000px' }}
            aria-hidden="true"
          >
            <input
              type="text"
              name="b_5381817b945cf1d237f219562_9366de9b6a"
              tabIndex={-1}
              defaultValue=""
            />
          </div>
          <div className="optionalParent">
            <div className="clear foot">
              <motion.input
                whileHover={{ backgroundColor: '#faf038' }}
                whileTap={{
                  backgroundColor: '#bdb405',
                  scale: 0.95
                }}
                className="button mt-3 lg:mt-6 inline-flex items-center justify-center space-x-1 px-4 lg:px-6 py-3 bg-[#f9ec0d] text-white leading-none lg:text-lg italic shadow uppercase"
                type="submit"
                defaultValue="Subscribe"
                name="subscribe"
                id="mc-embedded-subscribe"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default MailChimpSignUp
