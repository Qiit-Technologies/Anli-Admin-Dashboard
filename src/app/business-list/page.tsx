import BusinessList from "./components/businessList";

const businesses = [
  {
    name: "Corner Stone",
    subtext: "Managing and ensuring your comfort",
    icon: "/sample-company.png",
  },
  {
    name: "Lagos Continental Hotel",
    subtext: "Victoria Island",
    icon: "/sample-company.png",
  },
  {
    name: "Maison Fahrenheit",
    subtext: "Victoria Island",
    icon: "/sample-company.png",
  },
  {
    name: "Eko Hotels & Suites",
    subtext: "Victoria Island, lagos",
    icon: "/sample-company.png",
  },
  {
    name: "Bogobiri House",
    subtext: "Victoria Island",
    icon: "/sample-company.png",
  },
  {
    name: "Sheraton Lagos Hotel",
    subtext: "Ikeja",
    icon: "/sample-company.png",
  },
  {
    name: "The George Hotel",
    subtext: "Ikoyi lagos",
    icon: "/sample-company.png",
  },
  {
    name: "Amber Residence",
    subtext: "Wuse 2 Abuja",
    icon: "/sample-company.png",
  },
  {
    name: "Presken Hotels",
    subtext: "Ikeja & VI",
    icon: "/sample-company.png",
  },
];

export default function Page() {
  return <BusinessList data={businesses} />;
}
