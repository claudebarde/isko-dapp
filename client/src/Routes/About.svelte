<script>
  import { fly, fade } from "svelte/transition";

  const delay = 300;
</script>

<style>
  .container {
    width: 60%;
    margin: 0 auto;
    padding: 1.5rem;
    background-color: white;
    border: solid 1px white;
    border-radius: 0.25rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    text-align: center;
    z-index: 1;
  }

  .picture {
    width: 50%;
    margin-bottom: 40px;
  }

  .description {
    text-align: left !important;
    padding: 20px;
  }
  .description p {
    margin-left: 10px;
  }

  .subtitle {
    font-weight: bold;
    color: #4a5568;
    margin-left: 0px !important;
  }
</style>

<main>
  <div class="container">
    <img
      src="images/undraw_software_engineer.svg"
      alt="freelancer"
      class="picture"
      in:fade={{ duration: 600 }} />
    <h1 in:fly={{ y: 200, duration: 500, delay }}>Isko Translation App</h1>
    <h3 in:fly={{ y: 200, duration: 500, delay: delay + 300 }}>
      The first decentralized market for translators
    </h3>
    <div
      class="description"
      in:fly={{ y: 200, duration: 500, delay: delay + 300 * 2 }}>
      <h4 class="subtitle">Presentation</h4>
      <p>Isko Dapp is the first decentralized market for translators.</p>
      <p>
        It allows customers from around the world to post translation jobs in
        our secure audited smart contract and translators worldwide to get live
        alerts about new jobs and claim them before completing them in a timely
        manner.
      </p>
      <p>
        A wide range of different languages are accepted and our
        customer-feedback-based quality system insures that our customers get
        the best translation quality possible.
      </p>
      <h4 class="subtitle">How does it work as a customer?</h4>
      <p>
        The first step before posting a new translation job is to create an
        account. This only takes a minute. Please be aware that you must have
        MetaMask installed and that your wallet Ethereum will be linked to your
        account. You must select the wallet you used during the registration
        process to login every time.
      </p>
      <p>
        Once registered and logged in, you can access the new job creation post
        from the main page, from your account page or from the market page. Fill
        in the form and confirm the transaction through MetaMask to save the
        translation job. It's done! One of our freelance translators will pick
        up your translation and execute it as soon as possible.
      </p>
      <p>
        After the translation is posted, you can check it. If you are satisfied,
        you can approve the translation and the process is now over!
        <br />
        If you are not satisfied, you can add a comment and ask the translator
        to review it. Please be aware that every review request is saved on
        chain and incurs fees.
      </p>
      <p>
        The length of the translation you may request is limited to 600 kB of
        data, which allows you to ask for the translation of a few words or a
        few pages.
      </p>
      <h4 class="subtitle">How does it work as a translator?</h4>
      <p>
        The first step before accepting new translations is to officially become
        one of our translators!
        <br />
        You only need to fill the registration fill you will find in the home
        page or in the top bar. A one time registration of around $1 is asked to
        activate your account because translators with a total balance equal to
        zero will be considered as inactive (you can then withdraw this fee and
        any amount from your balance at any time).
      </p>
      <p>
        After the registration, you will have access to the market. This is
        where you will find the translations posted by our customers.
        <br />
        Every new job displays the following information:
      </p>
      <div>
        <ul>
          <li>Its identification number and its type (file or text)</li>
          <li>Its language pair</li>
          <li>The price in ETH</li>
          <li>Its content type</li>
          <li>Its due time</li>
        </ul>
      </div>
      <p>
        You just need to click on the "Claim" button to claim the translation.
        <br />
        Be aware that other translators may be claiming the same transaction at
        the same time and seeing a translation in the market doesn't necessarily
        mean that it is available. However, the market is updated in real time
        with an unevitable delay of a couple of seconds. You will receive a
        confirmation if you successfully claimed the translation.
      </p>
      <p>Once claimed, you are ready to work on the translation!</p>
      <p>
        If the translation was uploaded in a file, you can download the file and
        work in it.
        <br />
        If the text of the translation was directly uplaoded, you will be
        presented with a translation interface where you can input your
        translation before saving it. At any time of the process, you can add a
        comment for the customer to read if you have questions.
      </p>
      <p>
        After submitting your translation, the customer can decide to ask for
        change or correction. Please correct the translation in a timely fashion
        and resubmit it. You can communicate with the customer through the
        comments of the translation. Keep the messages courteous and
        professional.
      </p>
      <p>
        Once the customer is satisfied with your translation, they will approve
        it. They can decide to give you a "tip" and pay for the Ethereum fee
        resulting in changing the translation status on chain.
        <br />
        Otherwise, you will be able to change the status on chain yourself after
        5 days to add the price of the translation to your current balance.
      </p>
      <p>
        Customers can choose to leave a feedback mark for your service. The
        total of your feedback marks is added together and averaged every time a
        new feedback is provided. Please be aware that you are required to
        maintain a quality over 5/10 at all time. If your quality goes to 4/10
        or below, you won't be able to claim new jobs.
      </p>
      <p>
        Although working on a translation requires a minimum of 3 updates
        resulting in fees, there are only simple status changes in the contract
        and the total amount of the fees shouldn't exceed a few cents.
      </p>
      <p>
        After adding the price of the translation to your general balance, you
        are free to withdraw your ethers at any time you like.
      </p>
      <h4 class="subtitle">Terms and conditions</h4>
      <p>Last updated January 28, 2020</p>

      <p>AGREEMENT TO TERMS</p>

      <p>
        These Terms of Use constitute a legally binding agreement made between
        you, whether personally or on behalf of an entity (“you”) and Isko
        ("Company", “we”, “us”, or “our”), concerning your access to and use of
        the https://www.isko.app website as well as any other media form, media
        channel, mobile website or mobile application related, linked, or
        otherwise connected thereto (collectively, the “Site”). You agree that
        by accessing the Site, you have read, understood, and agreed to be bound
        by all of these Terms of Use. IF YOU DO NOT AGREE WITH ALL OF THESE
        TERMS OF USE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND
        YOU MUST DISCONTINUE USE IMMEDIATELY.
      </p>

      <p>
        Supplemental terms and conditions or documents that may be posted on the
        Site from time to time are hereby expressly incorporated herein by
        reference. We reserve the right, in our sole discretion, to make changes
        or modifications to these Terms of Use at any time and for any reason.
        We will alert you about any changes by updating the “Last updated” date
        of these Terms of Use, and you waive any right to receive specific
        notice of each such change. It is your responsibility to periodically
        review these Terms of Use to stay informed of updates. You will be
        subject to, and will be deemed to have been made aware of and to have
        accepted, the changes in any revised Terms of Use by your continued use
        of the Site after the date such revised Terms of Use are posted.
      </p>

      <p>
        The information provided on the Site is not intended for distribution to
        or use by any person or entity in any jurisdiction or country where such
        distribution or use would be contrary to law or regulation or which
        would subject us to any registration requirement within such
        jurisdiction or country. Accordingly, those persons who choose to access
        the Site from other locations do so on their own initiative and are
        solely responsible for compliance with local laws, if and to the extent
        local laws are applicable.
      </p>

      <p>
        The Site is intended for users who are at least 18 years old. Persons
        under the age of 18 are not permitted to use or register for the Site.
      </p>

      <p>INTELLECTUAL PROPERTY RIGHTS</p>
      <p>
        Unless otherwise indicated, the Site is our proprietary property and all
        source code, databases, functionality, software, website designs, audio,
        video, text, photographs, and graphics on the Site (collectively, the
        “Content”) and the trademarks, service marks, and logos contained
        therein (the “Marks”) are owned or controlled by us or licensed to us,
        and are protected by copyright and trademark laws and various other
        intellectual property rights and unfair competition laws of the United
        States, foreign jurisdictions, and international conventions. The
        Content and the Marks are provided on the Site “AS IS” for your
        information and personal use only. Except as expressly provided in these
        Terms of Use, no part of the Site and no Content or Marks may be copied,
        reproduced, aggregated, republished, uploaded, posted, publicly
        displayed, encoded, translated, transmitted, distributed, sold,
        licensed, or otherwise exploited for any commercial purpose whatsoever,
        without our express prior written permission.
      </p>
      <p>
        Provided that you are eligible to use the Site, you are granted a
        limited license to access and use the Site and to download or print a
        copy of any portion of the Content to which you have properly gained
        access solely for your personal, non-commercial use. We reserve all
        rights not expressly granted to you in and to the Site, the Content and
        the Marks.
      </p>
      <p>USER REPRESENTATIONS</p>
      <p>
        By using the Site, you represent and warrant that: (1) all registration
        information you submit will be true, accurate, current, and complete;
        (2) you will maintain the accuracy of such information and promptly
        update such registration information as necessary; (3) you have the
        legal capacity and you agree to comply with these Terms of Use; (4) you
        are not a minor in the jurisdiction in which you reside; (5) you will
        not access the Site through automated or non-human means, whether
        through a bot, script, or otherwise; (6) you will not use the Site for
        any illegal or unauthorized purpose; and (7) your use of the Site will
        not violate any applicable law or regulation.
      </p>
      <p>
        If you provide any information that is untrue, inaccurate, not current,
        or incomplete, we have the right to suspend or terminate your account
        and refuse any and all current or future use of the Site (or any portion
        thereof).
      </p>
      <p>USER REGISTRATION</p>
      <p>
        You may be required to register with the Site. You agree to keep your
        password confidential and will be responsible for all use of your
        account and password. We reserve the right to remove, reclaim, or change
        a username you select if we determine, in our sole discretion, that such
        username is inappropriate, obscene, or otherwise objectionable.
      </p>
      <p>PROHIBITED ACTIVITIES</p>
      <p>
        You may not access or use the Site for any purpose other than that for
        which we make the Site available. The Site may not be used in connection
        with any commercial endeavors except those that are specifically
        endorsed or approved by us.
      </p>
      <p>As a user of the Site, you agree not to:</p>
      1. Systematically retrieve data or other content from the Site to create
      or compile, directly or indirectly, a collection, compilation, database,
      or directory without written permission from us. 2. Trick, defraud, or
      mislead us and other users, especially in any attempt to learn sensitive
      account information such as user passwords. 3. Circumvent, disable, or
      otherwise interfere with security-related features of the Site, including
      features that prevent or restrict the use or copying of any Content or
      enforce limitations on the use of the Site and/or the Content contained
      therein. 4. Disparage, tarnish, or otherwise harm, in our opinion, us
      and/or the Site. 5. Use any information obtained from the Site in order to
      harass, abuse, or harm another person. 6. Make improper use of our support
      services or submit false reports of abuse or misconduct. 7. Use the Site
      to advertise or offer to sell goods and services. 8. Upload or transmit
      (or attempt to upload or to transmit) viruses, Trojan horses, or other
      material, including excessive use of capital letters and spamming
      (continuous posting of repetitive text), that interferes with any party’s
      uninterrupted use and enjoyment of the Site or modifies, impairs,
      disrupts, alters, or interferes with the use, features, functions,
      operation, or maintenance of the Site. 9. Attempt to impersonate another
      user or person or use the username of another user. 10. Sell or otherwise
      transfer your profile. 11. Upload or transmit (or attempt to upload or to
      transmit) any material that acts as a passive or active information
      collection or transmission mechanism, including without limitation, clear
      graphics interchange formats (“gifs”), 1×1 pixels, web bugs, cookies, or
      other similar devices (sometimes referred to as “spyware” or “passive
      collection mechanisms” or “pcms”). 12. Interfere with, disrupt, or create
      an undue burden on the Site or the networks or services connected to the
      Site. 13. Attempt to bypass any measures of the Site designed to prevent
      or restrict access to the Site, or any portion of the Site. 14. Copy or
      adapt the Site’s software, including but not limited to Flash, PHP, HTML,
      JavaScript, or other code. 15. Decipher, decompile, disassemble, or
      reverse engineer any of the software comprising or in any way making up a
      part of the Site. 16. Use a buying agent or purchasing agent to make
      purchases on the Site. 17. Make any unauthorized use of the Site,
      including collecting usernames and/or email addresses of users by
      electronic or other means for the purpose of sending unsolicited email, or
      creating user accounts by automated means or under false pretenses. 18.
      Use the Site as part of any effort to compete with us or otherwise use the
      Site and/or the Content for any revenue-generating endeavor or commercial
      enterprise.
      <p>USER GENERATED CONTRIBUTIONS</p>

      <p>
        The Site may invite you to chat, contribute to, or participate in blogs,
        message boards, online forums, and other functionality, and may provide
        you with the opportunity to create, submit, post, display, transmit,
        perform, publish, distribute, or broadcast content and materials to us
        or on the Site, including but not limited to text, writings, video,
        audio, photographs, graphics, comments, suggestions, or personal
        information or other material (collectively, "Contributions").
        Contributions may be viewable by other users of the Site and through
        third-party websites. As such, any Contributions you transmit may be
        treated as non-confidential and non-proprietary. When you create or make
        available any Contributions, you thereby represent and warrant that:
      </p>
      <ol>
        <li>
          The creation, distribution, transmission, public display, or
          performance, and the accessing, downloading, or copying of your
          Contributions do not and will not infringe the proprietary rights,
          including but not limited to the copyright, patent, trademark, trade
          secret, or moral rights of any third party.
        </li>
        <li>
          You are the creator and owner of or have the necessary licenses,
          rights, consents, releases, and permissions to use and to authorize
          us, the Site, and other users of the Site to use your Contributions in
          any manner contemplated by the Site and these Terms of Use.
        </li>
        <li>
          You have the written consent, release, and/or permission of each and
          every identifiable individual person in your Contributions to use the
          name or likeness of each and every such identifiable individual person
          to enable inclusion and use of your Contributions in any manner
          contemplated by the Site and these Terms of Use.
        </li>
        <li>Your Contributions are not false, inaccurate, or misleading.</li>
        <li>
          Your Contributions are not unsolicited or unauthorized advertising,
          promotional materials, pyramid schemes, chain letters, spam, mass
          mailings, or other forms of solicitation.
        </li>
        <li>
          Your Contributions are not obscene, lewd, lascivious, filthy, violent,
          harassing, libelous, slanderous, or otherwise objectionable (as
          determined by us).
        </li>
        <li>
          Your Contributions do not ridicule, mock, disparage, intimidate, or
          abuse anyone.
        </li>
        <li>
          Your Contributions do not advocate the violent overthrow of any
          government or incite, encourage, or threaten physical harm against
          another.
        </li>
        <li>
          Your Contributions do not violate any applicable law, regulation, or
          rule.
        </li>
        <li>
          Your Contributions do not violate the privacy or publicity rights of
          any third party.
        </li>
        <li>
          Your Contributions do not contain any material that solicits personal
          information from anyone under the age of 18 or exploits people under
          the age of 18 in a sexual or violent manner.
        </li>
        <li>
          Your Contributions do not violate any federal or state law concerning
          child pornography, or otherwise intended to protect the health or
          well-being of minors;
        </li>
        <li>
          Your Contributions do not include any offensive comments that are
          connected to race, national origin, gender, sexual preference, or
          physical handicap.
        </li>
        <li>
          Your Contributions do not otherwise violate, or link to material that
          violates, any provision of these Terms of Use, or any applicable law
          or regulation.
        </li>
      </ol>
      <p>
        Any use of the Site in violation of the foregoing violates these Terms
        of Use and may result in, among other things, termination or suspension
        of your rights to use the Site.
      </p>
      <p>CONTRIBUTION LICENSE</p>
      <p>
        By posting your Contributions to any part of the Site, you automatically
        grant, and you represent and warrant that you have the right to grant,
        to us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive,
        transferable, royalty-free, fully-paid, worldwide right, and license to
        host, use, copy, reproduce, disclose, sell, resell, publish, broadcast,
        retitle, archive, store, cache, publicly perform, publicly display,
        reformat, translate, transmit, excerpt (in whole or in part), and
        distribute such Contributions (including, without limitation, your image
        and voice) for any purpose, commercial, advertising, or otherwise, and
        to prepare derivative works of, or incorporate into other works, such
        Contributions, and grant and authorize sublicenses of the foregoing. The
        use and distribution may occur in any media formats and through any
        media channels.
      </p>

      <p>
        This license will apply to any form, media, or technology now known or
        hereafter developed, and includes our use of your name, company name,
        and franchise name, as applicable, and any of the trademarks, service
        marks, trade names, logos, and personal and commercial images you
        provide. You waive all moral rights in your Contributions, and you
        warrant that moral rights have not otherwise been asserted in your
        Contributions.
      </p>

      <p>
        We do not assert any ownership over your Contributions. You retain full
        ownership of all of your Contributions and any intellectual property
        rights or other proprietary rights associated with your Contributions.
        We are not liable for any statements or representations in your
        Contributions provided by you in any area on the Site. You are solely
        responsible for your Contributions to the Site and you expressly agree
        to exonerate us from any and all responsibility and to refrain from any
        legal action against us regarding your Contributions.
      </p>

      <p>
        We have the right, in our sole and absolute discretion, (1) to edit,
        redact, or otherwise change any Contributions; (2) to re-categorize any
        Contributions to place them in more appropriate locations on the Site;
        and (3) to pre-screen or delete any Contributions at any time and for
        any reason, without notice. We have no obligation to monitor your
        Contributions.
      </p>

      <p>GUIDELINES FOR REVIEWS</p>

      <p>
        We may provide you areas on the Site to leave reviews or ratings. When
        posting a review, you must comply with the following criteria:
      </p>
      <div>
        <ol>
          <li>
            you should not provide any personal information like your name, your
            email address or your phone number nor seek for business to be
            conducted outside of our platform;
          </li>
          <li>
            your reviews should not contain offensive profanity, or abusive,
            racist, offensive, or hate language;
          </li>
          <li>
            your reviews should not contain discriminatory references based on
            religion, race, gender, national origin, age, marital status, sexual
            orientation, or disability;
          </li>
          <li>
            your reviews should not contain references to illegal activity;
          </li>
          <li>
            you should not be affiliated with competitors if posting negative
            reviews;
          </li>
          <li>
            you should not make any conclusions as to the legality of conduct;
          </li>
          <li>
            you should not make any conclusions as to the legality of conduct;
          </li>
          <li>you may not post any false or misleading statements;</li>
          <li>
            you may not organize a campaign encouraging others to post reviews,
            whether positive or negative.
          </li>
        </ol>
      </div>

      <p>
        We may accept, reject, or remove reviews in our sole discretion. We have
        absolutely no obligation to screen reviews or to delete reviews, even if
        anyone considers reviews objectionable or inaccurate. Reviews are not
        endorsed by us, and do not necessarily represent our opinions or the
        views of any of our affiliates or partners. We do not assume liability
        for any review or for any claims, liabilities, or losses resulting from
        any review. By posting a review, you hereby grant to us a perpetual,
        non-exclusive, worldwide, royalty-free, fully-paid, assignable, and
        sublicensable right and license to reproduce, modify, translate,
        transmit by any means, display, perform, and/or distribute all content
        relating to reviews.
      </p>

      <p>SUBMISSIONS</p>

      <p>
        You acknowledge and agree that any questions, comments, suggestions,
        ideas, feedback, or other information regarding the Site ("Submissions")
        provided by you to us are non-confidential and shall become our sole
        property. We shall own exclusive rights, including all intellectual
        property rights, and shall be entitled to the unrestricted use and
        dissemination of these Submissions for any lawful purpose, commercial or
        otherwise, without acknowledgment or compensation to you. You hereby
        waive all moral rights to any such Submissions, and you hereby warrant
        that any such Submissions are original with you or that you have the
        right to submit such Submissions. You agree there shall be no recourse
        against us for any alleged or actual infringement or misappropriation of
        any proprietary right in your Submissions.
      </p>

      <p>ADVERTISERS</p>

      <p>
        We allow advertisers to display their advertisements and other
        information in certain areas of the Site, such as sidebar advertisements
        or banner advertisements. If you are an advertiser, you shall take full
        responsibility for any advertisements you place on the Site and any
        services provided on the Site or products sold through those
        advertisements. Further, as an advertiser, you warrant and represent
        that you possess all rights and authority to place advertisements on the
        Site, including, but not limited to, intellectual property rights,
        publicity rights, and contractual rights. We simply provide the space to
        place such advertisements, and we have no other relationship with
        advertisers.
      </p>

      <p>SITE MANAGEMENT</p>

      <p>
        We reserve the right, but not the obligation, to: (1) monitor the Site
        for violations of these Terms of Use; (2) take appropriate legal action
        against anyone who, in our sole discretion, violates the law or these
        Terms of Use, including without limitation, reporting such user to law
        enforcement authorities; (3) in our sole discretion and without
        limitation, refuse, restrict access to, limit the availability of, or
        disable (to the extent technologically feasible) any of your
        Contributions or any portion thereof; (4) in our sole discretion and
        without limitation, notice, or liability, to remove from the Site or
        otherwise disable all files and content that are excessive in size or
        are in any way burdensome to our systems; and (5) otherwise manage the
        Site in a manner designed to protect our rights and property and to
        facilitate the proper functioning of the Site.
      </p>

      <p>PRIVACY POLICY</p>

      <p>
        We care about data privacy and security. By using the Site, you agree to
        be bound by our Privacy Policy posted on the Site, which is incorporated
        into these Terms of Use. Please be advised the Site is hosted in the
        United States. If you access the Site from the European Union, Asia, or
        any other region of the world with laws or other requirements governing
        personal data collection, use, or disclosure that differ from applicable
        laws in the United States, then through your continued use of the Site,
        you are transferring your data to the United States, and you expressly
        consent to have your data transferred to and processed in the United
        States. Further, we do not knowingly accept, request, or solicit
        information from children or knowingly market to children. Therefore, in
        accordance with the U.S. Children’s Online Privacy Protection Act, if we
        receive actual knowledge that anyone under the age of 13 has provided
        personal information to us without the requisite and verifiable parental
        consent, we will delete that information from the Site as quickly as is
        reasonably practical.
      </p>

      <p>TERM AND TERMINATION</p>

      <p>
        These Terms of Use shall remain in full force and effect while you use
        the Site. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF USE, WE
        RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR
        LIABILITY, DENY ACCESS TO AND USE OF THE SITE (INCLUDING BLOCKING
        CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON,
        INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY,
        OR COVENANT CONTAINED IN THESE TERMS OF USE OR OF ANY APPLICABLE LAW OR
        REGULATION. WE MAY TERMINATE YOUR USE OR PARTICIPATION IN THE SITE OR
        DELETE YOUR ACCOUNT AND ANY CONTENT OR INFORMATION THAT YOU POSTED AT
        ANY TIME, WITHOUT WARNING, IN OUR SOLE DISCRETION.
      </p>

      <p>
        If we terminate or suspend your account for any reason, you are
        prohibited from registering and creating a new account under your name,
        a fake or borrowed name, or the name of any third party, even if you may
        be acting on behalf of the third party. In addition to terminating or
        suspending your account, we reserve the right to take appropriate legal
        action, including without limitation pursuing civil, criminal, and
        injunctive redress.
      </p>

      <p>MODIFICATIONS AND INTERRUPTIONS</p>

      <p>
        We reserve the right to change, modify, or remove the contents of the
        Site at any time or for any reason at our sole discretion without
        notice. However, we have no obligation to update any information on our
        Site. We also reserve the right to modify or discontinue all or part of
        the Site without notice at any time. We will not be liable to you or any
        third party for any modification, price change, suspension, or
        discontinuance of the Site.
      </p>

      <p>
        We cannot guarantee the Site will be available at all times. We may
        experience hardware, software, or other problems or need to perform
        maintenance related to the Site, resulting in interruptions, delays, or
        errors. We reserve the right to change, revise, update, suspend,
        discontinue, or otherwise modify the Site at any time or for any reason
        without notice to you. You agree that we have no liability whatsoever
        for any loss, damage, or inconvenience caused by your inability to
        access or use the Site during any downtime or discontinuance of the
        Site. Nothing in these Terms of Use will be construed to obligate us to
        maintain and support the Site or to supply any corrections, updates, or
        releases in connection therewith.
      </p>

      <p>DISPUTE RESOLUTION</p>

      <p>Informal Negotiations</p>

      <p>
        To expedite resolution and control the cost of any dispute, controversy,
        or claim related to these Terms of Use (each a "Dispute" and
        collectively, the “Disputes”) brought by either you or us (individually,
        a “Party” and collectively, the “Parties”), the Parties agree to first
        attempt to negotiate any Dispute (except those Disputes expressly
        provided below) informally for at least __________ days before
        initiating arbitration. Such informal negotiations commence upon written
        notice from one Party to the other Party.
      </p>

      <p>Restrictions</p>

      <p>
        The Parties agree that any arbitration shall be limited to the Dispute
        between the Parties individually. To the full extent permitted by law,
        (a) no arbitration shall be joined with any other proceeding; (b) there
        is no right or authority for any Dispute to be arbitrated on a
        class-action basis or to utilize class action procedures; and (c) there
        is no right or authority for any Dispute to be brought in a purported
        representative capacity on behalf of the general public or any other
        persons.
      </p>

      <p>Exceptions to Informal Negotiations and Arbitration</p>
      <p>
        The Parties agree that the following Disputes are not subject to the
        above provisions concerning informal negotiations and binding
        arbitration: (a) any Disputes seeking to enforce or protect, or
        concerning the validity of, any of the intellectual property rights of a
        Party; (b) any Dispute related to, or arising from, allegations of
        theft, piracy, invasion of privacy, or unauthorized use; and (c) any
        claim for injunctive relief. If this provision is found to be illegal or
        unenforceable, then neither Party will elect to arbitrate any Dispute
        falling within that portion of this provision found to be illegal or
        unenforceable and such Dispute shall be decided by a court of competent
        jurisdiction within the courts listed for jurisdiction above, and the
        Parties agree to submit to the personal jurisdiction of that court.
      </p>

      <p>CORRECTIONS</p>

      <p>
        There may be information on the Site that contains typographical errors,
        inaccuracies, or omissions, including descriptions, pricing,
        availability, and various other information. We reserve the right to
        correct any errors, inaccuracies, or omissions and to change or update
        the information on the Site at any time, without prior notice.
      </p>

      <p>DISCLAIMER</p>

      <p>
        THE SITE IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. YOU AGREE THAT
        YOUR USE OF THE SITE AND OUR SERVICES WILL BE AT YOUR SOLE RISK. TO THE
        FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR
        IMPLIED, IN CONNECTION WITH THE SITE AND YOUR USE THEREOF, INCLUDING,
        WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
        FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE MAKE NO WARRANTIES OR
        REPRESENTATIONS ABOUT THE ACCURACY OR COMPLETENESS OF THE SITE’S CONTENT
        OR THE CONTENT OF ANY WEBSITES LINKED TO THE SITE AND WE WILL ASSUME NO
        LIABILITY OR RESPONSIBILITY FOR ANY (1) ERRORS, MISTAKES, OR
        INACCURACIES OF CONTENT AND MATERIALS, (2) PERSONAL INJURY OR PROPERTY
        DAMAGE, OF ANY NATURE WHATSOEVER, RESULTING FROM YOUR ACCESS TO AND USE
        OF THE SITE, (3) ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS
        AND/OR ANY AND ALL PERSONAL INFORMATION AND/OR FINANCIAL INFORMATION
        STORED THEREIN, (4) ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR
        FROM THE SITE, (5) ANY BUGS, VIRUSES, TROJAN HORSES, OR THE LIKE WHICH
        MAY BE TRANSMITTED TO OR THROUGH THE SITE BY ANY THIRD PARTY, AND/OR (6)
        ANY ERRORS OR OMISSIONS IN ANY CONTENT AND MATERIALS OR FOR ANY LOSS OR
        DAMAGE OF ANY KIND INCURRED AS A RESULT OF THE USE OF ANY CONTENT
        POSTED, TRANSMITTED, OR OTHERWISE MADE AVAILABLE VIA THE SITE. WE DO NOT
        WARRANT, ENDORSE, GUARANTEE, OR ASSUME RESPONSIBILITY FOR ANY PRODUCT OR
        SERVICE ADVERTISED OR OFFERED BY A THIRD PARTY THROUGH THE SITE, ANY
        HYPERLINKED WEBSITE, OR ANY WEBSITE OR MOBILE APPLICATION FEATURED IN
        ANY BANNER OR OTHER ADVERTISING, AND WE WILL NOT BE A PARTY TO OR IN ANY
        WAY BE RESPONSIBLE FOR MONITORING ANY TRANSACTION BETWEEN YOU AND ANY
        THIRD-PARTY PROVIDERS OF PRODUCTS OR SERVICES. AS WITH THE PURCHASE OF A
        PRODUCT OR SERVICE THROUGH ANY MEDIUM OR IN ANY ENVIRONMENT, YOU SHOULD
        USE YOUR BEST JUDGMENT AND EXERCISE CAUTION WHERE APPROPRIATE.
      </p>

      <p>LIMITATIONS OF LIABILITY</p>

      <p>
        IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO
        YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL,
        EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST
        PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR
        USE OF THE SITE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH
        DAMAGES. NOTWITHSTANDING ANYTHING TO THE CONTRARY CONTAINED HEREIN, OUR
        LIABILITY TO YOU FOR ANY CAUSE WHATSOEVER AND REGARDLESS OF THE FORM OF
        THE ACTION, WILL AT ALL TIMES BE LIMITED TO THE AMOUNT PAID, IF ANY, BY
        YOU TO US DURING THE ONE (1) MONTH PERIOD PRIOR TO ANY CAUSE OF ACTION
        ARISING. CERTAIN STATE LAWS DO NOT ALLOW LIMITATIONS ON IMPLIED
        WARRANTIES OR THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES. IF THESE
        LAWS APPLY TO YOU, SOME OR ALL OF THE ABOVE DISCLAIMERS OR LIMITATIONS
        MAY NOT APPLY TO YOU, AND YOU MAY HAVE ADDITIONAL RIGHTS.
      </p>

      <p>INDEMNIFICATION</p>

      <p>
        You agree to defend, indemnify, and hold us harmless, including our
        subsidiaries, affiliates, and all of our respective officers, agents,
        partners, and employees, from and against any loss, damage, liability,
        claim, or demand, including reasonable attorneys’ fees and expenses,
        made by any third party due to or arising out of: (1) your
        Contributions; (2) use of the Site; (3) breach of these Terms of Use;
        (4) any breach of your representations and warranties set forth in these
        Terms of Use; (5) your violation of the rights of a third party,
        including but not limited to intellectual property rights; or (6) any
        overt harmful act toward any other user of the Site with whom you
        connected via the Site. Notwithstanding the foregoing, we reserve the
        right, at your expense, to assume the exclusive defense and control of
        any matter for which you are required to indemnify us, and you agree to
        cooperate, at your expense, with our defense of such claims. We will use
        reasonable efforts to notify you of any such claim, action, or
        proceeding which is subject to this indemnification upon becoming aware
        of it.
      </p>

      <p>USER DATA</p>

      <p>
        We will maintain certain data that you transmit to the Site for the
        purpose of managing the performance of the Site, as well as data
        relating to your use of the Site. Although we perform regular routine
        backups of data, you are solely responsible for all data that you
        transmit or that relates to any activity you have undertaken using the
        Site. You agree that we shall have no liability to you for any loss or
        corruption of any such data, and you hereby waive any right of action
        against us arising from any such loss or corruption of such data.
      </p>

      <p>ELECTRONIC COMMUNICATIONS, TRANSACTIONS, AND SIGNATURES</p>

      <p>
        Visiting the Site, sending us emails, and completing online forms
        constitute electronic communications. You consent to receive electronic
        communications, and you agree that all agreements, notices, disclosures,
        and other communications we provide to you electronically, via email and
        on the Site, satisfy any legal requirement that such communication be in
        writing. YOU HEREBY AGREE TO THE USE OF ELECTRONIC SIGNATURES,
        CONTRACTS, ORDERS, AND OTHER RECORDS, AND TO ELECTRONIC DELIVERY OF
        NOTICES, POLICIES, AND RECORDS OF TRANSACTIONS INITIATED OR COMPLETED BY
        US OR VIA THE SITE. You hereby waive any rights or requirements under
        any statutes, regulations, rules, ordinances, or other laws in any
        jurisdiction which require an original signature or delivery or
        retention of non-electronic records, or to payments or the granting of
        credits by any means other than electronic means.
      </p>

      <p>MISCELLANEOUS</p>

      <p>
        These Terms of Use and any policies or operating rules posted by us on
        the Site or in respect to the Site constitute the entire agreement and
        understanding between you and us. Our failure to exercise or enforce any
        right or provision of these Terms of Use shall not operate as a waiver
        of such right or provision. These Terms of Use operate to the fullest
        extent permissible by law. We may assign any or all of our rights and
        obligations to others at any time. We shall not be responsible or liable
        for any loss, damage, delay, or failure to act caused by any cause
        beyond our reasonable control. If any provision or part of a provision
        of these Terms of Use is determined to be unlawful, void, or
        unenforceable, that provision or part of the provision is deemed
        severable from these Terms of Use and does not affect the validity and
        enforceability of any remaining provisions. There is no joint venture,
        partnership, employment or agency relationship created between you and
        us as a result of these Terms of Use or use of the Site. You agree that
        these Terms of Use will not be construed against us by virtue of having
        drafted them. You hereby waive any and all defenses you may have based
        on the electronic form of these Terms of Use and the lack of signing by
        the parties hereto to execute these Terms of Use.
      </p>

      <p>CONTACT US</p>

      <p>
        In order to resolve a complaint regarding the Site or to receive further
        information regarding use of the Site, please contact us at:
      </p>

      <p>
        Isko
        <br />
        Kuala Lumpur
        <br />
        Malaysia
        <br />
        iskodapp@gmail.com
      </p>
    </div>
  </div>
</main>
