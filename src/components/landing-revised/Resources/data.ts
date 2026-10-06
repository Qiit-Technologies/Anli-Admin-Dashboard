export type Categories =
    | 'Featured Articles'
    | 'White papers & Guides'
    | 'Case Studies';

export interface Resource {
    id: string;
    type: Categories;
    title: string;
    description?: string;
    content?: string;
    link?: string;
    image?: string;
    datePosted: string;
    readTime: number;
    tags: string[];
    contentJsx?: boolean;
}

export interface ResourceDocs {
    id: string;
    title: string;
    type: Categories;
    points?: string[];
    content?: string;
    image?: string;
    link?: string;
    pdfLink?: string;
    datePosted: string;
    readTime: number;
    tags: string[];
}

export interface ResourceCardProps {
    id: string;
    title: string;
    type: Categories;
    description?: string;
    content?: string;
    points?: string[];
    image?: string;
    link?: string;
    pdfLink?: string;
    datePosted: string;
    readTime: number;
    tags: string[];
    contentJsx?: boolean;
}

const sampleContent = `
<hr class="my-4 border-gray-200" />
<h2 class="text-2xl font-bold mb-4">A New Era in Hospitality</h2>
<p class="mb-4">
    In a world where guest expectations are evolving rapidly, the hospitality industry must
    continuously adapt to remain competitive, relevant, and exceptional. For Corniche Hotel, a
    brand built on timeless elegance and warm, attentive service, the journey toward modernization
    has never been about replacing tradition — but about enhancing it.
</p>
<p class="mb-4">
    To meet the demands of the modern traveler while retaining the soulful charm of traditional
    hospitality, Corniche partnered with Anli Solutions, a leader in hospitality transformation. This
    collaboration has birthed a new chapter — one where comfort meets intelligence, and
    efficiency meets heart.
</p>
<p class="mb-4">
    Whether it's streamlining check-in, personalizing guest experiences, or empowering staff
    through innovation, Anli Solutions is helping Corniche deliver five-star service with a human
    touch.
</p>
<hr class="my-4 border-gray-200" />
<h2 class="text-2xl font-bold mb-4">Building the Foundation — The Corniche-Anli Vision</h2>
<p class="mb-4">
    Anli Solutions approaches hotel partnerships with a bespoke strategy. Every solution is
    tailored to the unique strengths, weaknesses, and long-term goals of the hotel.
    For Corniche Hotel, Anli began by asking one key question:
    “What does effortless hospitality look like for your guests — and your team?”
</p>
<p class="mb-4">
    The answers became the pillars of a shared vision:
</p>
<ul class="list-disc mb-4">
    <li>Elevate the guest journey from start to finish.</li>
    <li>Empower staff with tools, training, and real-time data.</li>
    <li>Streamline operations to reduce friction and increase responsiveness.</li>
    <li>Use innovation to amplify—not replace—hospitality’s human core.</li>
</ul>
<p class="mb-4">
    Anli’s role is not to impose change, but to curate transformation — making Corniche’s
    excellence more visible, efficient, and consistent across every department.
</p>
<hr class="my-4 border-gray-200" />
    <h2 class="text-2xl font-bold mb-4">The Experience Upgrade – Where Innovation Meets Care</h2>
<p class="mb-4">
    The Corniche-Anli partnership is about more than just technology — it’s about elevating
    the guest experience from start to finish.
</p>
<p class="mb-4">
    Here’s how Anli Solutions is transforming Corniche Hotel:
</p>
<ul class="list-disc pl-5 mb-4">
    <li>Mobile Check-In & Keyless Entry: Guests can now check in via mobile and unlock
    rooms with digital keys, cutting down wait time and contact.
    <li>Smart Guest Profiles: With CRM-driven insights, returning guests are welcomed by
    name, offered their favorite tea, or placed in their preferred room type.
    <li>Virtual Concierge Service: Whether on WhatsApp or the hotel app, guests can now ask
    for room service, spa bookings, or airport transfers 24/7 — without calling reception.
    <li>Self-Service Kiosks: For those in a hurry or seeking privacy, kiosks offer express
    check-in/out, bill payment, and print services — at the guest’s pace.
    <li>Real-Time Feedback Forms: QR-code surveys and in-room tablets allow guests to rate
    service or report issues immediately, enabling instant recovery and improved loyalty.
    </li>
</ul>
<p class="mb-4">
    These tools don’t replace warmth — they make room for more of it. By automating routine
    processes, staff can focus on meaningful interactions — a warm smile, a helpful
    recommendation, or a heartfelt “welcome back.”
</p>
<hr class="my-4 border-gray-200" />
    <h2 class="text-2xl font-bold mb-4">Behind the Scenes — Operational Excellence</h2>
<p class="mb-4">
    An unforgettable guest experience starts long before the guest arrives — and extends far
    beyond check-out. Anli has helped Corniche align back-end operations to this belief:
</p>
<ul class="list-disc mb-4">
    <li>🔧 Efficient Housekeeping & Maintenance</li>
    Using a cloud-based operations dashboard, the moment a guest checks out, housekeeping is
    alerted. Maintenance requests are assigned in real time based on urgency and technician
    availability. Tasks are no longer manually written or delayed — they're tracked, completed, and
    reported with transparency.
</p>
<p class="mb-4">
    <li>📊 Smart Data for Smart Decisions</li>
    Anli’s reporting tools give hotel managers insight into:
</p>
<ul class="list-disc mb-4">
    <li>Average service response times</li>
    <li>Most requested guest services</li>
    <li>Staff performance by department</li>
    <li>Maintenance trends and recurring complaints</li>
</p>
<p class="mb-4">
    This allows leadership to predict, plan, and improve, rather than constantly react.
</p>
<p class="mb-4">
    <li>📚 Staff Empowerment Through Training</li>
    Anli also prioritizes people. Staff at Corniche receive ongoing digital training on using new tools,
    engaging with guests through tech, and delivering consistent experiences. The result? A
    confident, connected team that adapts quickly and serves with pride.
</p>
<hr class="my-4 border-gray-200" />
    <h2 class="text-2xl font-bold mb-4">Hospitality Reimagined — The Road Ahead</h2>
<p class="mb-4">
    The success of Corniche Hotel’s transformation lies not just in flashy upgrades — but in
    thoughtful progress. Every system, every strategy, every tool introduced by Anli serves a
    deeper purpose:
    To make hospitality feel natural, luxurious, and effortless — for everyone.
</p>
<p class="mb-4">
    As this partnership grows, future plans include:
</p>
<ul class="list-disc mb-4">
    <li>AI-enhanced guest personalization, offering tailor-made experiences</li>
    <li>Loyalty programs tied to digital experiences and feedback</li>
    <li>Green energy optimization, reducing power waste across departments</li>
    <li>Virtual event and meeting solutions for business travelers</li>
</p>
<p class="mb-4">
    Corniche is becoming more than just a hotel — it’s becoming a modern sanctuary where
    guests feel known, understood, and delighted.
</p>
<hr class="my-4 border-gray-200" />
    <h2 class="text-2xl font-bold mb-4">In Summary</h2>
<p class="mb-4">
    With Anli Solutions as a strategic partner, Corniche Hotel is not just keeping up with the times
    - it’s leading with intention. Together, they are proving that the future of hospitality doesn’t
    mean sacrificing warmth or tradition. Instead, it’s about finding the perfect balance between
    what’s classic and what’s next.
    Modern comfort. Classic hospitality. Thoughtful innovation.
    That’s what sets Corniche Hotel apart — with Anli at the helm.
</p>
`;

const content2 = `
<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">Overview</h2>
            <p class="mb-5">
                Corniche Hotel, a prominent hospitality brand, faced growing operational challenges, particularly in front desk management, housekeeping coordination, inventory tracking, and overall guest experience delivery. Seeking a comprehensive and modern solution, they partnered with ANLI Solutions to overhaul and digitize their operations.
            </p>
            
            <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">Objective:</h3>
            <ul class="list-disc pl-6 mb-6 space-y-2">
                <li>Improve operational efficiency</li>
                <li>Streamline communication between departments</li>
                <li>Enhance guest satisfaction</li>
                <li>Increase revenue and reduce manual workloads</li>
            </ul>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">Challenges Faced by Corniche Hotel</h2>
            <p class="mb-4">Before implementing ANLI Solutions, Corniche Hotel struggled with several operational inefficiencies:</p>
            <ul class="list-disc pl-6 mb-6 space-y-2">
                <li>Manual check-in/check-out processes causing delays</li>
                <li>Housekeeping tasks managed through paper logs</li>
                <li>Lack of real-time inventory management leading to stockouts</li>
                <li>Siloed departmental communication causing inefficiencies</li>
                <li>Limited visibility into revenue and performance metrics</li>
            </ul>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">The ANLI Solutions Approach</h2>
            <p class="mb-4">ANLI Solutions proposed a phased migration plan to address these challenges systematically:</p>
            
            <div class="space-y-6 my-6">
                <div class="pl-4 border-l-4 border-gray-200">
                    <h3 class="text-xl font-bold text-gray-900 mb-3">1. Front Office Automation</h3>
                    <ul class="list-disc pl-6 space-y-2">
                        <li>Introduction of digital check-in/check-out.</li>
                        <li>Real-time room availability updates.</li>
                    </ul>
                </div>
                
                <div class="pl-4 border-l-4 border-gray-200">
                    <h3 class="text-xl font-bold text-gray-900 mb-3">2. Housekeeping Management</h3>
                    <ul class="list-disc pl-6 space-y-2">
                        <li>Mobile access to cleaning schedules and task status.</li>
                        <li>Instant room status updates to front desk.</li>
                    </ul>
                </div>
                
                <div class="pl-4 border-l-4 border-gray-200">
                    <h3 class="text-xl font-bold text-gray-900 mb-3">3. Stock/Inventory Management</h3>
                    <ul class="list-disc pl-6 space-y-2">
                        <li>Automated inventory tracking with alert systems.</li>
                        <li>Simplified supplier order management.</li>
                    </ul>
                </div>
                
                <div class="pl-4 border-l-4 border-gray-200">
                    <h3 class="text-xl font-bold text-gray-900 mb-3">4. Restaurant Management</h3>
                    <ul class="list-disc pl-6 space-y-2">
                        <li>Centralized food and beverage POS integration.</li>
                        <li>Real-time updates between restaurant and kitchen operations.</li>
                    </ul>
                </div>
                
                <div class="pl-4 border-l-4 border-gray-200">
                    <h3 class="text-xl font-bold text-gray-900 mb-3">5. Future Phases (Planned)</h3>
                    <ul class="list-disc pl-6 space-y-2">
                        <li>HR, Payroll, and full accounting suite integrations.</li>
                    </ul>
                </div>
            </div>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">Results Achieved</h2>
            <p class="mb-4">The implementation of ANLI Solutions led to significant improvements across all key metrics:</p>
            
            <div class="overflow-x-auto my-8">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Metric
                            </th>
                            <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Before ANLI Solutions
                            </th>
                            <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                After ANLI Solutions
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                Front desk processing time
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                10 minutes per guest
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                3 minutes per guest
                            </td>
                        </tr>
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                Housekeeping response time
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                2 hours
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                45 minutes
                            </td>
                        </tr>
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                Inventory order delays
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                Frequent
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                Rare
                            </td>
                        </tr>
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                Guest satisfaction score
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                75%
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                92%
                            </td>
                        </tr>
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                Operational efficiency
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                -
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                                +60% improvement
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">Key Improvements:</h3>
            <ul class="list-disc pl-6 mb-6 space-y-2">
                <li>Significant time savings for both guests and staff.</li>
                <li>Real-time data access across all departments.</li>
                <li>Better inventory control and fewer guest complaints.</li>
                <li>Improved coordination between operations, housekeeping, and F&B teams.</li>
            </ul>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">Client Testimonial</h2>
            <blockquote class="border-l-4 border-gray-300 pl-4 py-2 my-8 italic text-gray-600">
                <p class="mb-4">
                    "ANLI Solutions transformed how we operate. Our guests are happier, our team works more smoothly, and we've seen a 60% improvement in our overall efficiency within months. We couldn't have asked for a better partner."
                </p>
                <footer class="text-right font-medium text-gray-700">
                    — General Manager, Corniche Hotel
                </footer>
            </blockquote>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">Conclusion</h2>
            <p class="mb-5">
                Corniche Hotel's partnership with ANLI Solutions has demonstrated that the right technology can not only simplify hotel management but also deliver remarkable improvements in operational performance and guest satisfaction.
            </p>
            
            <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">Next Steps:</h3>
            <ul class="list-disc pl-6 mb-6 space-y-2">
                <li>Full integration of HR and payroll management.</li>
                <li>Expansion into multi-property management with ANLI Solutions.</li>
            </ul>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">About ANLI Solutions</h2>
            <p class="mb-5">
                ANLI Solutions is a future-focused hospitality management platform that empowers hotels to streamline operations, boost revenue, and enhance guest experiences. With modular, easy-to-use technology, we are building the future of hotel management, today.
            </p>
`;

const content3 = `
<p class="mb-6 text-lg leading-relaxed">
                The hotel industry is undergoing a profound transformation. Rapid technological advancements, shifting guest expectations, and a demand for greater operational efficiency are redefining the future of hotel management. As we move deeper into the digital age, forward-thinking hoteliers must embrace innovation, sustainability, and personalization to remain competitive and exceed guest expectations.
            </p>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">Embracing Technology: The New Standard</h2>
            <p class="mb-6 leading-relaxed">
                Technology is no longer a luxury; it is now the backbone of modern hotel management. Cloud-based Property Management Systems (PMS) allow hoteliers to manage reservations, front desk operations, housekeeping, and guest communications from a centralized platform. Integration with booking engines, channel managers, and customer relationship management (CRM) systems ensures a seamless guest journey from the initial booking to post-stay engagement.
            </p>
            <p class="mb-6 leading-relaxed">
                Artificial intelligence (AI) and machine learning are further pushing boundaries. Predictive analytics optimize pricing and occupancy rates, chatbots enhance customer service, and AI-driven marketing tailors promotional offers to individual guest preferences.
            </p>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">Guest Experience: Personalization at Scale</h2>
            <p class="mb-6 leading-relaxed">
                Today's guests expect more than just a comfortable room – they seek memorable, customized experiences. Future hotel management must prioritize personalization by leveraging guest data to offer curated recommendations, room preferences, and personalized amenities. From mobile check-ins to smart room technologies that adapt to guest behaviors, personalization is key to loyalty and satisfaction.
            </p>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">Sustainability: A Non-Negotiable Factor</h2>
            <p class="mb-6 leading-relaxed">
                Environmental responsibility is a growing priority for travelers. Hotels that implement eco-friendly initiatives such as energy-saving systems, waste reduction programs, and sustainable sourcing will stand out. Smart building technologies that monitor and optimize energy usage will become standard, not optional, in future hotel operations.
            </p>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">Workforce Evolution: Tech-Savvy and Service-Oriented</h2>
            <p class="mb-6 leading-relaxed">
                While automation will handle repetitive tasks, the human element in hospitality remains irreplaceable. Future hotel teams will need to be tech-savvy, focusing on delivering exceptional, high-touch guest interactions. Training programs will evolve to emphasize both technological proficiency and soft skills like emotional intelligence and problem-solving.
            </p>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">Revenue Management: Real-Time, Dynamic, and AI-Driven</h2>
            <p class="mb-6 leading-relaxed">
                Revenue management will rely heavily on real-time data, competitor insights, and advanced algorithms. Dynamic pricing models, fueled by AI, will help hoteliers adjust rates instantly based on demand forecasts, market trends, and booking patterns. This agility will be crucial for maximizing profitability.
            </p>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">The Rise of Alternative Accommodations</h2>
            <p class="mb-6 leading-relaxed">
                The line between hotels, serviced apartments, and short-term rentals like Airbnb continues to blur. Future hotel management will involve offering flexible stay options, adapting marketing strategies to appeal to various traveler segments, and potentially managing multi-property or hybrid portfolios under one cohesive brand.
            </p>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">Conclusion: Building the Hotel of Tomorrow</h2>
            <p class="mb-6 leading-relaxed">
                The future of hotel management belongs to those who innovate, adapt, and place guests at the center of their strategy. Investing in the right technology, focusing on personalization, committing to sustainability, and empowering staff will enable hotels to thrive in a rapidly evolving landscape. The winners of tomorrow will be those who see change not as a challenge, but as an extraordinary opportunity to redefine hospitality.
            </p>
`;

const content4 = `
<p class="mb-6 text-lg leading-relaxed">
                In today's dynamic hospitality industry, one of the biggest strategic decisions for hotel owners and operators is whether to prioritize direct bookings or rely on Online Travel Agencies (OTAs) like Booking.com, Expedia, or Airbnb. Both channels offer distinct advantages and challenges, and understanding the nuances of each can empower hoteliers to make smarter, more profitable decisions.
            </p>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">What Are Direct Bookings?</h2>
            <p class="mb-6 leading-relaxed">
                Direct bookings occur when a guest makes a reservation directly through your hotel's website, mobile app, phone line, or social media platforms, without the involvement of third-party intermediaries.
            </p>
            
            <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">Advantages of Direct Bookings:</h3>
            <ul class="mb-6 pl-5 space-y-3 list-disc">
                <li class="leading-relaxed">
                    <span class="font-medium">Higher Profit Margins:</span> No OTA commission fees (often ranging between 15%-25%), meaning you retain more revenue.
                </li>
                <li class="leading-relaxed">
                    <span class="font-medium">Direct Customer Relationship:</span> Building relationships with guests allows you to personalize services, improve loyalty, and encourage repeat stays.
                </li>
                <li class="leading-relaxed">
                    <span class="font-medium">Brand Control:</span> You have complete control over your branding, messaging, and the guest experience.
                </li>
                <li class="leading-relaxed">
                    <span class="font-medium">Data Ownership:</span> Direct bookings provide valuable guest data that can be used for marketing, loyalty programs, and guest experience improvements.
                </li>
            </ul>
            
            <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">Disadvantages of Direct Bookings:</h3>
            <ul class="mb-6 pl-5 space-y-3 list-disc">
                <li class="leading-relaxed">
                    <span class="font-medium">Marketing Costs:</span> Significant investment needed in SEO, digital ads, website maintenance, and content marketing to drive traffic.
                </li>
                <li class="leading-relaxed">
                    <span class="font-medium">Lower Visibility:</span> Without the wide audience of OTAs, it can be harder for smaller or new hotels to reach potential guests.
                </li>
                <li class="leading-relaxed">
                    <span class="font-medium">Trust Building:</span> Guests often trust OTAs for reviews, ratings, and security, which may require hotels to work harder to establish credibility.
                </li>
            </ul>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">What Are OTA Bookings?</h2>
            <p class="mb-6 leading-relaxed">
                OTA bookings are made through third-party travel websites that showcase hotels, flights, rental cars, and vacation packages.
            </p>
            
            <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">Advantages of OTA Bookings:</h3>
            <ul class="mb-6 pl-5 space-y-3 list-disc">
                <li class="leading-relaxed">
                    <span class="font-medium">Wider Reach:</span> OTAs expose your hotel to millions of potential customers worldwide.
                </li>
                <li class="leading-relaxed">
                    <span class="font-medium">Immediate Trust:</span> OTAs are trusted brands with strong marketing budgets and recognizable names.
                </li>
                <li class="leading-relaxed">
                    <span class="font-medium">Reduced Marketing Burden:</span> Hotels can leverage the marketing and advertising efforts of OTAs without shouldering all the costs themselves.
                </li>
                <li class="leading-relaxed">
                    <span class="font-medium">Easy to Scale:</span> OTAs offer instant scalability, allowing small properties to quickly access a global market.
                </li>
            </ul>
            
            <h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">Disadvantages of OTA Bookings:</h3>
            <ul class="mb-6 pl-5 space-y-3 list-disc">
                <li class="leading-relaxed">
                    <span class="font-medium">High Commission Fees:</span> OTAs typically take a significant percentage of each booking.
                </li>
                <li class="leading-relaxed">
                    <span class="font-medium">Less Control:</span> Limited ability to upsell, personalize experiences, or build brand loyalty directly with the guest.
                </li>
                <li class="leading-relaxed">
                    <span class="font-medium">Dependency Risk:</span> Heavy reliance on OTAs can be risky if terms change or partnerships end.
                </li>
                <li class="leading-relaxed">
                    <span class="font-medium">Data Limitations:</span> Less access to guest data, making it harder to craft personalized marketing campaigns.
                </li>
            </ul>
            
            <div class="my-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h2 class="text-2xl font-bold text-gray-900 mb-4">Finding the Right Balance</h2>
                <p class="leading-relaxed">
                    Successful hotels often find a balance between direct bookings and OTA partnerships. While OTAs can drive volume and visibility, nurturing direct channels is essential for profitability and long-term brand growth.
                </p>
            </div>
            
            <h3 class="text-xl font-bold text-gray-900 mt-10 mb-4">Tips for Strengthening Direct Bookings:</h3>
            <ul class="mb-6 pl-5 space-y-3 list-disc">
                <li class="leading-relaxed">Invest in a user-friendly, mobile-optimized website.</li>
                <li class="leading-relaxed">Offer best-rate guarantees on direct bookings.</li>
                <li class="leading-relaxed">Implement loyalty programs with attractive rewards.</li>
                <li class="leading-relaxed">Use email marketing and retargeting ads to re-engage past guests.</li>
                <li class="leading-relaxed">Leverage social media and influencer marketing to expand brand reach.</li>
            </ul>
            
            <h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">Conclusion</h2>
            <p class="mb-6 leading-relaxed">
                Both direct bookings and OTAs have critical roles to play in a modern hotel's distribution strategy. By understanding the strengths and weaknesses of each and developing a balanced, strategic approach, hoteliers can optimize profitability, build stronger customer relationships, and future-proof their businesses.
            </p>
`;

const content5 = `
<p class="mb-6 text-lg leading-relaxed">
    In the heart of Wuse, Abuja; a district where tradition meets modern energy, sits <strong>Westbury Inn</strong>, a bijou art boutique hotel defined by its charm, creative soul, and reputation for quiet luxury. It's the kind of place where every hallway tells a story through artwork and atmosphere.
</p>

<p class="mb-6 leading-relaxed">
    But beneath the calm elegance of Westbury's day-to-day operations, a subtle challenge had begun to surface.
</p>

<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">The Quiet Problem with "Working Just Fine"</h2>
<p class="mb-6 leading-relaxed">
    Westbury Inn wasn't in trouble. Its legacy systems from manual booking logs to paper-based housekeeping checklists were familiar, functional, and even somewhat comforting to the team. Guests were still being served with warmth and care. Staff knew how to navigate their routines. On the surface, everything was fine.
</p>

<p class="mb-6 leading-relaxed">
    But "fine" doesn't always mean future-ready.
</p>

<p class="mb-6 leading-relaxed">
    In a fast-paced hospitality world where guests book on the move, expect instant confirmations, and prefer personalisation at scale, Westbury's reliable systems started to feel... limiting. There were moments of double-bookings, delays in responding to maintenance requests, and missed upselling opportunities, not due to lack of effort, but because the tools were no longer keeping up.
</p>

<p class="mb-6 leading-relaxed">
    That's when Westbury Inn brought in <strong>Anli Solutions</strong>, not to fix a crisis, but to unlock hidden potential.
</p>

<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">The Brief: Keep the Soul, Upgrade the System</h2>
<p class="mb-6 leading-relaxed">
    Westbury Inn didn't want to become a cold, hyper-automated hotel. It wanted to be better at being <em>Westbury</em>. The brief was clear:
</p>

<ul class="mb-6 pl-5 space-y-3 list-disc">
    <li class="leading-relaxed">Preserve the intimacy, charm, and creative personality of the hotel</li>
    <li class="leading-relaxed">Modernize internal systems without overwhelming the staff or changing the brand feel</li>
    <li class="leading-relaxed">Improve operational speed, accuracy, and guest experience, all in one go</li>
</ul>

<p class="mb-6 leading-relaxed">
    Anli's role wasn't to wipe the slate clean. It was to build a smarter canvas for Westbury's story.
</p>

<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">Enter the Cloud: Practical, Invisible, Transformative</h2>

<h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">1. Cloud-Based Guest Management</h3>
<p class="mb-6 leading-relaxed">
    No more juggling calls and calendars. Westbury's reservations now sync across all booking platforms from its website to third-party travel apps, updating room availability in real time and eliminating human error. The front desk team sees everything at a glance.
</p>

<h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">2. Guest Insights in One Tap</h3>
<p class="mb-6 leading-relaxed">
    Every returning guest now comes with context, preferences, stay history, dietary notes, even room temperature habits. Westbury uses this to create delightful touches that feel effortless, but go a long way in guest satisfaction.
</p>

<h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">3. Digitized Housekeeping Workflow</h3>
<p class="mb-6 leading-relaxed">
    Forget scribbled task lists. Room readiness is now tracked digitally, with notifications sent directly to staff devices. Turnaround time is faster, and accountability is crystal clear.
</p>

<h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">4. Maintenance with Eyes Everywhere</h3>
<p class="mb-6 leading-relaxed">
    When a guest reports a leaky tap, it's logged instantly and assigned to the right technician, complete with timelines, notes, and a resolution tracker.
</p>

<h3 class="text-xl font-bold text-gray-900 mt-8 mb-4">5. Cloud Reporting</h3>
<p class="mb-6 leading-relaxed">
    From occupancy rates to staff productivity, Anli's platform provides real-time dashboards that help Westbury forecast better, plan smarter, and notice patterns they never saw before.
</p>

<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">Staff Reactions: A Surprising Turn</h2>
<p class="mb-6 leading-relaxed">
    At first, some Westbury employees were hesitant. Would tech make things impersonal? Would it mean longer hours or complicated new routines?
</p>

<p class="mb-6 leading-relaxed">
    What they discovered was the opposite:
</p>

<ul class="mb-6 pl-5 space-y-3 list-disc">
    <li class="leading-relaxed">Less guesswork</li>
    <li class="leading-relaxed">Faster problem-solving</li>
    <li class="leading-relaxed">More energy to focus on <em>guests</em>, not paperwork</li>
</ul>

<p class="mb-6 leading-relaxed">
    Today, the team says they feel more confident and empowered.
</p>

<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">A Boutique Hotel in a Cloud World</h2>
<p class="mb-6 leading-relaxed">
    Boutique hotels often worry that technology will erase their human touch. But Westbury Inn's story proves otherwise. With the right partner, tech becomes invisible, a silent supporter behind the scenes, making sure nothing slips, no guest goes unnoticed, and no detail is missed.
</p>

<p class="mb-6 leading-relaxed">
    With Anli Solutions, Westbury didn't just upgrade, it evolved. Not because it had to, but because it was ready for more.
</p>

<h2 class="text-2xl font-bold text-gray-900 mt-10 mb-5">Looking Ahead</h2>
<p class="mb-6 leading-relaxed">
    This transformation is only the beginning. Westbury Inn is now exploring:
</p>

<ul class="mb-6 pl-5 space-y-3 list-disc">
    <li class="leading-relaxed">A mobile app for guest requests and local art recommendations</li>
    <li class="leading-relaxed">AI-powered analytics to understand seasonal trends</li>
    <li class="leading-relaxed">Smart energy systems to enhance sustainability</li>
    <li class="leading-relaxed">An integrated loyalty program tailored to its creative traveler base</li>
</ul>

<p class="mb-6 leading-relaxed">
    Westbury Inn didn't abandon its legacy, it carried it forward, onto the cloud. The Westbury Inn you know and love hasn't changed, it's simply grown smarter. With Anli Solutions as a trusted partner, the hotel is proving that <strong>legacy and innovation aren't opposites</strong>, they're companions.
</p>

<div class="my-10 p-6 bg-gray-50 rounded-lg border border-gray-200">
    <p class="leading-relaxed font-medium">
        When done right, digital transformation doesn't change who you are. It reveals how much more you can become.
    </p>
</div>
`;

export const featuredArticles: Resource[] = [
    {
        id: 'fa-001',
        title: 'Modern Comfort Meets Classic Hospitality',
        description: 'How Corniche is Raising the Bar with Anli Solutions',
        type: 'Featured Articles',
        image: '/landing/brands/corniche.jpg',
        content: sampleContent,
        contentJsx: true,
        datePosted: '2023-11-15T08:30:00Z',
        readTime: 8,
        tags: ['hotel', 'hospitality', 'travel', 'comfort', 'classic'],
    },
    {
        id: 'fa-002',
        title: 'The Future of Hotel Management',
        description: 'How Automation is chaning the industry',
        type: 'Featured Articles',
        image: '/landing/product/hero-landing.jpg',
        content: content3,
        datePosted: '2023-11-15T08:30:00Z',
        readTime: 8,
        tags: ['automation', 'AI', 'hotel-management', 'technology', 'PMS'],
    },
    {
        id: 'fa-003',
        title: 'Direct Bookings vs. OTAs',
        description: 'How to Maximize Hotel Revenue.',
        type: 'Featured Articles',
        image: '/landing/resources/fa2.jpg',
        content: content4,
        datePosted: '2023-10-28T14:15:00Z',
        readTime: 6,
        tags: ['revenue-management', 'OTA', 'direct-bookings', 'sales'],
    },
    {
        id: 'fa-004',
        title: 'Sustainable Hospitality Practices',
        description:
            'Learn about eco-friendly initiatives and sustainable practices that modern hotels are implementing.',
        type: 'Featured Articles',
        image: '/landing/resources/fa3.jpg',
        content:
            'Discover eco-friendly initiatives and sustainable practices that modern hotels are implementing.',
        datePosted: '2023-09-15T10:45:00Z',
        readTime: 12,
        tags: [
            'sustainability',
            'eco-friendly',
            'green-hospitality',
            'environment',
        ],
    },
    {
        id: 'fa-005',
        title: 'AI in Hotel Operations',
        description:
            'Understanding the role of artificial intelligence in revolutionizing hotel management and guest services.',
        type: 'Featured Articles',
        image: '/landing/resources/fa4.jpg',
        content:
            'Understanding the role of artificial intelligence in revolutionizing hotel management and guest services.',
        datePosted: '2023-11-01T16:20:00Z',
        readTime: 10,
        tags: [
            'AI',
            'operations',
            'guest-services',
            'technology',
            'innovation',
        ],
    },
];

export const whitePapersGuide: ResourceDocs[] = [
    {
        id: 'wp-001',
        title: 'The Hoteliers Handbook 2025/2026',
        type: 'White papers & Guides',
        image: '/landing/resources/anli-hotelier-guide.jpg',
        pdfLink:
            'https://drive.google.com/uc?export=download&id=1OtFRwEQ-oAa1BTTWwbsqJH2FcUBBZiRq',
        points: [
            'A comprehensive industry report covering trends, challenges, and future predictions.',
            'Key insights into digital transformation, sustainability, and guest expectations.',
        ],
        datePosted: '2023-11-20T09:00:00Z',
        readTime: 15,
        tags: [
            'industry-trends',
            'digital-transformation',
            'sustainability',
            'hospitality',
        ],
    },
    {
        id: 'wp-003',
        title: 'How to Choose the Right Property Management System PMS',
        type: 'White papers & Guides',
        image: '/landing/resources/wp4.jpg',
        link: '',
        pdfLink:
            'https://drive.google.com/uc?export=download&id=1n7a0HXSDjn1rqxmIGLqkb_RGL5BUsR9e',
        points: [
            'What to look for when selecting a modern PMS for your hotel.',
            'A checklist of must-have features, integrations, and security considerations.',
        ],
        datePosted: '2023-10-25T11:15:00Z',
        readTime: 12,
        tags: ['PMS', 'hotel-technology', 'software-selection', 'security'],
    },
    {
        id: 'wp-003',
        title: 'The Ultimate Guide to Hotel Revenue Management',
        type: 'White papers & Guides',
        image: '/landing/resources/ughr.jpg',
        link: '',
        points: [
            'Step-by-step strategies to optimize pricing, demand forecasting, and profitability.',
            'Insights on leveraging AI and automation for revenue growth.',
        ],
        datePosted: '2023-11-10T14:30:00Z',
        readTime: 12,
        tags: ['revenue-management', 'pricing-strategy', 'AI', 'automation'],
    },
    {
        id: 'wp-004',
        title: 'How to Choose the Right Property Management System (PMS)',
        type: 'White papers & Guides',
        image: '/landing/resources/wp3.jpg',
        link: '',
        points: [
            'What to look for when selecting a modern PMS for your hotel.',
            'A checklist of must-have features, integrations, and security considerations.',
        ],
        datePosted: '2023-10-25T11:15:00Z',
        readTime: 12,
        tags: ['PMS', 'hotel-technology', 'software-selection', 'security'],
    },
];

export const caseStudies: ResourceDocs[] = [
    {
        id: 'cs-001',
        title: 'How Corniche Hotel Improved Efficiency by 60% with ANLI Solutions',
        type: 'Case Studies',
        image: '/landing/resources/cs1.jpg',
        points: [
            'Learn how Corniche Hotel automated its front office, housekeeping, and inventory.',
            'Measurable results: faster check-ins, improved guest satisfaction, and increased revenue.',
        ],
        content: content2,
        datePosted: '2023-11-18T08:45:00Z',
        readTime: 18,
        tags: ['automation', 'efficiency', 'case-study', 'hotel-operations'],
    },
    {
        id: 'cs-002',
        title: 'Transforming Mid-Sized Hotels: The ANLI Impact',
        type: 'Case Studies',
        image: '/landing/resources/cs2.jpg',
        points: [
            'A deep dive into how ANLI Solutions helped a 100-room hotel streamline operations.',
            'Key takeaways on workflow automation and better inventory control.',
        ],
        datePosted: '2023-11-05T16:20:00Z',
        readTime: 15,
        tags: [
            'mid-sized-hotels',
            'workflow-automation',
            'inventory-management',
        ],
    },
    {
        id: 'cs-003',
        title: 'From Legacy Systems to Cloud: A Hotels Digital Transformation Story',
        type: 'Case Studies',
        image: '/landing/resources/cs3.jpg',
        points: [
            'A 4-star hotels journey from outdated, manual processes to a fully integrated cloud solution',
            'Insights on cost savings, staff efficiency, and guest experience improvements.',
        ],
        datePosted: '2023-10-22T13:40:00Z',
        readTime: 20,
        content: content5,
        tags: [
            'digital-transformation',
            'cloud-technology',
            'efficiency',
            'modernization',
        ],
    },
    {
        id: 'cs-004',
        title: 'Smart Hotel Technology Integration',
        type: 'Case Studies',
        image: '/landing/resources/cs4.jpg',
        points: [
            'A 5-star hotels journey from legacy systems to a modern, cloud-based solution.',
            'Key takeaways on workflow automation and better inventory control.',
        ],
        readTime: 18,
        datePosted: '2023-10-15T10:30:00Z',
        tags: [
            'smart-hotel',
            'technology-integration',
            'automation',
            'cloud-solutions',
        ],
    },
];
