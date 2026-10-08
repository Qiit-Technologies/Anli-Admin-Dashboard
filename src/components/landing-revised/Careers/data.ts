export interface CareerCardProps {
    id: string;
    title: string;
    location: string;
    employmentType: string;
    roleOverview: string;
    keyResponsibility: string[];
    requirements: string[];
    niceToHave: string[];
    whatWeOffer?: string[];
    aboutAnli?: string[];
    detailedResponsibility?: { title: string; responsibility: string[] }[];
    kpi?: string[];
    skillsAndCompetencies?: string[];
    expectation?: string[];
    toolsAndResources?: string[];
    growthOpportunities?: string[];
    datePosted: string;
}

export const featuredCareers: CareerCardProps[] = [
    {
        datePosted: '2023-11-18T08:45:00Z',
        id: 'ca-001',
        title: 'Frontend Developer (React/Next.js)',
        location: 'Remote / Hybrid (Nigeria or Germany preferred)',
        aboutAnli: [
            'ANLI Solutions is building innovative property and hospitality management systems that empower hoteliers, restaurants, and facility managers to streamline operations, manage inventories, handle accounting, and optimize revenue. Our platform is fast-growing, and we are looking for a talented Frontend Developer to join our team.',
        ],
        employmentType: 'Full-time',
        roleOverview:
            'As a Frontend Developer at ANLI Solutions, you will be responsible for creating engaging, high-performance, and scalable user interfaces across our web and mobile platforms. You will work closely with backend engineers, designers, and product managers to deliver intuitive user experiences that meet our customers’ needs in the hospitality industry.',
        keyResponsibility: [
            'Build and maintain responsive, scalable, and accessible user interfaces using React, React Native, and Next.js.',
            'Collaborate with backend engineers to integrate APIs and ensure smooth data flow.',
            'Translate UI/UX wireframes and mockups into pixel-perfect, high-quality code.',
            'Optimize applications for maximum speed, performance, and scalability.',
            'Implement reusable components and frontend libraries for efficiency.',
            'Participate in code reviews, testing, and deployment pipelines.',
            'Troubleshoot, debug, and resolve frontend issues.',
            'Stay up to date with modern frontend development practices and technologies.',
        ],
        requirements: [
            'Proven experience as a Frontend Developer (2+ years preferred).',
            'Strong proficiency in JavaScript (ES6+), React.js, Next.js, and React Native.',
            'Good understanding of HTML5, CSS3, TailwindCSS (or similar frameworks).',
            'Familiarity with RESTful APIs, GraphQL, and integration best practices.',
            'Experience with version control tools like Git/GitHub.',
            'Knowledge of frontend testing frameworks (Jest, Cypress, etc.).',
            'Ability to work in an agile, fast-paced startup environment.',
            'Strong problem-solving skills and attention to detail.',
        ],
        niceToHave: [
            'Experience with TypeScript.',
            'Familiarity with state management libraries (Redux, Recoil, Zustand).',
            'Experience building progressive web apps (PWA).',
            'Knowledge of CI/CD pipelines for frontend deployments.',
            'Exposure to hospitality, SaaS, or PMS systems.',
        ],
    },

    {
        datePosted: '2023-11-18T08:45:00Z',
        id: 'ca-003',
        title: 'Customer Technical Support Agent',
        location: 'Remote / Hybrid / On-site (Specify)',
        aboutAnli: [
            'ANLI is a hospitality-focused technology company building modern tools for hotels, restaurants, and short-stay businesses. Our property management system (PMS) helps businesses manage reservations, inventories, accounting, restaurants, bars, and more.',
            'We’re growing fast and are looking for passionate Customer Technical Support Agents to join our team.',
        ],
        employmentType: '',
        roleOverview:
            'As a Customer Technical Support Agent at ANLI, you will be the first line of contact for our customers. You will help hotel and restaurant managers, staff, and administrators resolve technical issues, understand how to use ANLI’s modules, and ensure they get the best experience from our products.',
        keyResponsibility: [
            'Provide first-line support for customer inquiries via phone, chat, email, and ticketing system.',
            'Diagnose and resolve software-related issues within ANLI PMS and modules.',
            'Guide customers through system navigation, configurations, and troubleshooting.',
            'Escalate complex issues to engineering teams with clear documentation.',
            'Assist with onboarding and training new customers on ANLI products.',
            'Collect and relay customer feedback to improve product features.',
            'Maintain accurate records of customer interactions and technical issues.',
        ],
        requirements: [
            '1–2 years of experience in technical support, IT helpdesk, or customer service (preferably SaaS or hospitality tech).',
            'Strong knowledge of hospitality workflows (hotel front desk, reservations, restaurants, bars, etc.) is a plus.',
            'Basic understanding of software troubleshooting and ticketing systems.',
            'Excellent communication skills (written and spoken).',
            'Problem-solving mindset and ability to stay calm under pressure.',
            'Ability to work independently and as part of a distributed team.',
            'Languages: English required; German or French is a plus.',
        ],
        niceToHave: [],
        whatWeOffer: [
            'Competitive compensation package.',
            'Opportunity to work in a fast-growing startup shaping hospitality tech in Africa and beyond.',
            'Training and career growth opportunities.',
            'Collaborative, innovative work culture.',
        ],
    },
    {
        datePosted: '2023-11-18T08:45:00Z',
        id: 'ca-004',
        title: 'Tech Sales Agent',
        location: 'Remote / Hybrid / On-site (Specify)',
        employmentType: '',
        roleOverview:
            'The Tech Sales Agent will serve as the face of ANLI Solutions within their assigned region, responsible for driving product sales, building strong client relationships, and ensuring smooth pre- and post-sales support. This role combines consultative selling, product expertise, and customer success management to accelerate adoption of our Property Management System (PMS) and related modules.',
        keyResponsibility: [],
        detailedResponsibility: [
            {
                title: 'Pre-Sales Support',
                responsibility: [
                    'Conduct prospect research within assigned territory (hotels, lounges, restaurants, short-term rentals, private clubs).',
                    'Schedule and deliver product demos, both virtually and in-person.',
                    'Educate prospects on the benefits of ANLI’s PMS and its modules (Front Office, Inventory, Restaurant, Accounting, Bar, etc.).',
                    'Assist in preparing customized proposals and quotes.',
                    'Collaborate with the Product and Marketing teams to tailor pitches for specific client needs.',
                ],
            },
            {
                title: 'Sales Execution',
                responsibility: [
                    'Meet monthly and quarterly sales targets for new customer acquisition.',
                    'Identify opportunities for upselling and cross-selling additional modules.',
                    'Negotiate contracts, pricing, and terms in line with company guidelines.',
                    'Represent ANLI Solutions at industry events, mixers, roadshows, and conferences.',
                    'Build and maintain a strong pipeline of leads using CRM tools.',
                ],
            },
            {
                title: 'Post-Sales Support',
                responsibility: [
                    'Act as the first point of contact for customers after onboarding.',
                    'Ensure smooth handover to the Customer Success / Technical Support team.',
                    'Gather client feedback and relay product improvement requests to the Product team.',
                    'Provide training and workshops for customer staff when required.',
                    'Proactively check-in with clients to encourage usage and reduce churn.',
                ],
            },
        ],
        requirements: [],
        niceToHave: [],
        kpi: [
            'Sales Targets: X number of hotels/clients signed monthly/quarterly.',
            'Customer Retention: Maintain 90%+ customer retention within assigned location.',
            'Customer Satisfaction: Positive post-sales feedback scores.',
            'Lead Generation: Consistent pipeline with at least X qualified leads per month.',
            'Revenue Growth: Achievement of revenue targets from new and existing customers.',
        ],
        skillsAndCompetencies: [
            'Strong background in B2B technology sales, preferably SaaS or hospitality solutions.',
            'Excellent communication, negotiation, and presentation skills.',
            'Ability to understand technical concepts and explain them in business-friendly terms.',
            'Self-motivated with strong organizational and time management abilities.',
            'Knowledge of the hospitality industry and hotel operations is a plus.',
        ],
        expectation: [
            'Represent ANLI Solutions professionally at all times.',
            'Travel within assigned location to meet prospects and customers.',
            'Be proactive in reporting sales activities, challenges, and wins to management.',
            'Collaborate with other departments (Engineering, Marketing, Customer Success).',
            'Continuously upskill through internal product training and market research.',
        ],
        toolsAndResources: [
            'CRM System for pipeline management.',
            'Product Training and demo environment access.',
            'Marketing Materials (brochures, presentations, case studies).',
            'Email/Communication tools (Zoho Mail, Teams).',
            'Support team for onboarding and technical queries.',
        ],
        growthOpportunities: [
            'Career progression into Territory Manager / Regional Sales Lead based on performance.',
            'Opportunity to manage strategic accounts.',
            'Incentive-based bonuses tied to performance.',
        ],
    },
    {
        datePosted: '2023-11-18T08:45:00Z',
        id: 'ca-002',
        title: 'Backend Engineer',
        location: 'Remote / Hybrid / On-site (Specify)',
        aboutAnli: [
            'ANLI Solutions is building next-generation hospitality and property management software. We empower hotels, restaurants, and property managers with tools that streamline operations, manage inventories, optimize revenue, and enhance customer experiences.',
            'We are looking for sound Backend Engineers to join our fast-growing team and help build scalable, secure, and efficient systems.',
        ],
        employmentType: '',
        roleOverview:
            'We are looking for sound Backend Engineers to join our fast-growing team and help build scalable, secure, and efficient systems.',
        keyResponsibility: [
            'Design, build, and maintain scalable backend services and APIs.',
            'Integrate with third-party APIs (e.g., OTAs, payment gateways, delivery platforms like Glovo).',
            'Ensure system security, data privacy, and compliance with industry standards.',
            'Write efficient, reusable, and testable code.',
            'Work closely with frontend engineers to define API contracts and integrations.',
            'Optimize application performance and scalability.',
            'Participate in system architecture discussions and propose improvements.',
            'Maintain technical documentation and contribute to engineering best practices.',
        ],
        requirements: [
            'Strong proficiency in backend programming languages (Node.js, Python, or Java preferred).',
            'Solid understanding of RESTful API design and GraphQL (a plus).',
            'Experience with relational databases (PostgreSQL, MySQL) and caching systems (Redis).',
            'Familiarity with cloud platforms (AWS, GCP, or Azure).',
            'Experience with authentication, authorization, and secure API practices.',
            'Strong knowledge of software engineering principles, design patterns, and best practices.',
            'Hands-on experience with CI/CD pipelines and version control (Git/GitHub).',
            'Excellent problem-solving skills and ability to think through backend logics.',
        ],
        niceToHave: [
            'Experience integrating with external services (payments, bookings, inventory management).',
            'Knowledge of microservices and containerization (Docker, Kubernetes).',
            'Background in hospitality, restaurant, or property management systems.',
            'Familiarity with event-driven architectures.',
        ],
        whatWeOffer: [
            'Opportunity to work on impactful products in hospitality tech.',
            'Collaborative, innovative, and fast-paced environment.',
            'Career growth and skill development.',
            'Competitive compensation package.',
        ],
    },
];
