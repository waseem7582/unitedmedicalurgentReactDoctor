import { AiOutlineDown } from "react-icons/ai";
/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Card,
  CardBody,
  CloseButton,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  Select,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ComboboxDemo } from "../../components/ComboBox";
import { MultiTagInput } from "../../components/MultiTaginput";
import { ADD, GET } from "../../Controllers/ApiControllers";
import {
  default as ShowToast,
  default as showToast,
} from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import ISDCODEMODAL from "../../components/IsdModal";
import todayDate from "../../Controllers/today";

export default function AddDoctor() {
  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [profilePicture, setprofilePicture] = useState(null);
  const [departmentID, setdepartmentID] = useState();
  const [specializationID, setspecializationID] = useState([]);
  const [isd_code, setisd_code] = useState("+91");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const inputRef = useRef();

  // CERTIFICATE UPLOAD STATES 
  const [certificateFile, setCertificateFile] = useState(null);        // Stores the selected certificate file object
  const [certificatePreview, setCertificatePreview] = useState(null);  // Stores image preview URL for certificate display

    // HANDLE PROFILE PICTURE CHANGE
  
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setprofilePicture(selectedFile);
  };

  // ==================== CERTIFICATE UPLOAD FUNCTIONS ====================

  /**
   * @param {Event} event - The file input change event
   */
  const handleCertificateChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Define allowed file types for certificates
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const maxSize = 2 * 1024 * 1024; 
      
      if (!validTypes.includes(file.type)) {
        ShowToast(toast, "error", "Please select a valid file (JPG, PNG, PDF)");
        return;
      }
      if (file.size > maxSize) {
        ShowToast(toast, "error", "File size must be less than 2MB");
        return;
      }
      
      setCertificateFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setCertificatePreview(e.target.result);
        reader.readAsDataURL(file); // Convert file to data URL for preview
      } else {
        setCertificatePreview(null); // No preview for PDF files
      }
    }
  };

  // HANDLE CERTIFICATE REMOVE
  const handleCertificateRemove = () => {
    setCertificateFile(null);
    setCertificatePreview(null);
  };


    // ADD NEW DOCTOR
  const AddNew = async (data) => {
    if (data.password != data.cnfPassword) {
      return showToast(toast, "error", "password does not match");
    }

    if (!departmentID) {
      return showToast(toast, "error", "select department");
    }

    if (!specializationID) {
      return showToast(toast, "error", "select specialization");
    }

    // Create FormData object to handle file uploads
    let formData = new FormData(); 
    formData.append('f_name', data.f_name);
    formData.append('l_name', data.l_name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('phone', data.phone);
    formData.append('dob', data.dob);
    formData.append('gender', data.gender);
    formData.append('ex_year', data.ex_year);
    formData.append('department', departmentID);
    formData.append('specialization', specializationID.join(", "));
    formData.append('active', 0);
    formData.append('isd_code', isd_code);
    if (profilePicture) {
      formData.append('image', profilePicture);
    }
    if (certificateFile) {
      formData.append('certificate', certificateFile);
    }

    try {
      setisLoading(true);
      // Send form data to API (true parameter indicates file upload)
      const res = await ADD(admin.token, "add_doctor", formData, true);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Doctor Added Successfully!");
        queryClient.invalidateQueries("doctors");
        reset();
        navigate(`/doctor/update/${res.id}`);
      } else {
        console.log(res);
        ShowToast(toast, "error", `${res.message} - ${res.response}`);
      }
    } catch (error) {
      console.log(error);
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  // API QUERIES 
  const getDepartmentList = async () => {
    const res = await GET(admin.token, "get_department_active");
    return res.data;
  };

  const { data: departmentList } = useQuery({
    queryKey: ["department-active"],
    queryFn: getDepartmentList,
  });

  const getSpclizeList = async () => {
    const res = await GET(admin.token, "get_specialization");
    return res.data;
  };

  const { data: specializationList } = useQuery({
    queryKey: ["specialization"],
    queryFn: getSpclizeList,
  });

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Text fontSize={20} fontWeight={500}>
          Add Doctor
        </Text>
        <Button
          w={120}
          size={"sm"}
          variant={useColorModeValue("blackButton", "gray")}
          onClick={() => {
            navigate(-1);
          }}
        >
          Back
        </Button>
      </Flex>

      <Flex gap={10}>
        <Card mt={5} bg={useColorModeValue("white", "gray.700")} w={"70%"}>
          <CardBody p={3} as={"form"} onSubmit={handleSubmit(AddNew)}>
            <Flex gap={10}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  w={250}
                  type="email"
                  placeholder="Email"
                  {...register("email", { required: true })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Password"
                  {...register("password", { required: true })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  placeholder="Password"
                  {...register("cnfPassword", { required: true })}
                />
              </FormControl>
            </Flex>
            <Flex gap={10} mt={5}>
              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  placeholder="First Name"
                  {...register("f_name", { required: true })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Last Name</FormLabel>
                <Input
                  placeholder="Last Name"
                  {...register("l_name", { required: true })}
                />
              </FormControl>
            </Flex>

            <Flex gap={10} mt={5}>
              <FormControl isRequired>
                <FormLabel>Phone</FormLabel>
                <InputGroup>
                  <InputLeftAddon
                    cursor={"pointer"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen();
                    }}
                  >
                    {isd_code} <AiOutlineDown style={{ marginLeft: "10px" }} />
                  </InputLeftAddon>
                  <Input
                    type="tel"
                    placeholder="phone Number"
                    {...register("phone", {
                      required: true,
                      pattern: /^[0-9]+$/,
                    })}
                  />
                </InputGroup>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Date Of Birth (MM/DD/YYYY)</FormLabel>
                <Input
                  max={todayDate()}
                  placeholder="Select Date"
                  size="md"
                  type="date"
                  {...register("dob", { required: true })}
                />
              </FormControl>
            </Flex>

            <Flex gap={10} mt={5}>
              <FormControl isRequired>
                <FormLabel>Gender</FormLabel>
                <Select
                  placeholder="Select Gender"
                  {...register("gender", { required: true })}
                >
                  <option value="Female">Female</option>{" "}
                  <option value="Male">Male</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Years OF Experience</FormLabel>
                <Input
                  type="number"
                  placeholder="Years OF Experience"
                  {...register("ex_year", { required: true })}
                />
              </FormControl>
            </Flex>

            <Flex gap={10} mt={5}>
              <FormControl isRequired>
                <FormLabel>Department</FormLabel>
                <ComboboxDemo
                  name={"Department"}
                  data={departmentList}
                  setState={setdepartmentID}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Specialization</FormLabel>
                <MultiTagInput
                  data={specializationList}
                  setState={setspecializationID}
                  name={"Specialization"}
                />
              </FormControl>
            </Flex>

            {/* This section appears after specialization for certificate upload */}
            <Card mt={5} bg={useColorModeValue("gray.50", "gray.600")}>
              <CardBody p={3}>
                <Text fontSize="md" fontWeight="bold" mb={3}>
                  Doctor Certificate (Optional)
                </Text>
                <Text fontSize="xs" color="gray.500" mb={3}>
                  Upload doctor's certificate for QR code verification (JPG, PNG, PDF - Max 2MB)
                </Text>
                
                <VStack spacing={3} align="stretch">
                  {/* ========== CERTIFICATE FILE INPUT ========== */}
                  <Input
                    size={"sm"}
                    borderRadius={6}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"  // Only accept these file types
                    onChange={handleCertificateChange}  // Handle file selection
                  />
                  
                  {/* ========== CERTIFICATE PREVIEW SECTION ========== */}
                  {/* Shows preview for image files (not PDFs) */}
                  {certificatePreview && (
                    <Box mt={2}>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Certificate Preview:
                      </Text>
                      <Flex align="center" gap={3}>
                        <Image
                          src={certificatePreview}
                          alt="Certificate preview"
                          maxH="150px"
                          objectFit="contain"
                          border="1px"
                          borderColor="gray.200"
                          borderRadius="md"
                        />
                        {/* Remove button for certificate */}
                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="outline"
                          onClick={handleCertificateRemove}
                        >
                          Remove
                        </Button>
                      </Flex>
                    </Box>
                  )}

                  {/* ========== PDF FILE INDICATOR ========== */}
                  {/* Shows when PDF file is selected (no preview available) */}
                  {certificateFile && certificateFile.type === 'application/pdf' && (
                    <Box mt={2} p={3} border="1px" borderColor="blue.200" borderRadius="md" bg="blue.50">
                      <Flex align="center" justify="space-between">
                        <Text fontSize="sm" fontWeight="medium" color="blue.700">
                          📄 PDF Certificate Selected: {certificateFile.name}
                        </Text>
                        <Button
                          size="xs"
                          colorScheme="red"
                          variant="outline"
                          onClick={handleCertificateRemove}
                        >
                          Remove
                        </Button>
                      </Flex>
                    </Box>
                  )}

                  {/* ========== CERTIFICATE UPLOAD INFO ========== */}
                  <Text fontSize="xs" color="gray.600" mt={2}>
                    💡 This certificate will be used for QR code verification. 
                    Users can scan the QR code on the doctor profile to view this certificate.
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            {/* ==================== END OF CERTIFICATE UPLOAD SECTION ==================== */}

            {/* ========== SUBMIT BUTTON ========== */}
            <Button
              w={"100%"}
              mt={10}
              type="submit"
              colorScheme="green"
              size={"sm"}
              isLoading={isLoading}
            >
              Add
            </Button>
          </CardBody>
        </Card>
        <Card
          mt={5}
          bg={useColorModeValue("white", "gray.700")}
          w={"25%"}
          h={"fit-content"}
          pb={10}
        >
          <CardBody p={2}>
            <Text textAlign={"center"}>Profile Picture</Text>
            <Divider></Divider>
            <Flex p={2} justify={"center"} mt={5} position={"relative"}>
              <Image
                borderRadius={"50%"}
                h={200}
                objectFit={"cover"}
                w={200}
                src={
                  profilePicture
                    ? URL.createObjectURL(profilePicture)
                    : "/admin/profilePicturePlaceholder.png"
                }
              />
              {profilePicture && (
                <Tooltip label="Clear" fontSize="md">
                  <CloseButton
                    colorScheme="red"
                    variant={"solid"}
                    position={"absolute"}
                    right={2}
                    onClick={() => {
                      setprofilePicture(null);
                    }}
                  />
                </Tooltip>
              )}
            </Flex>
            <VStack spacing={4} align="stretch" mt={10}>
              <Input
                type="file"
                display="none" // Hide the actual file input
                ref={inputRef}
                onChange={handleFileChange}
                accept=".jpeg, .svg, .png , .jpg"
              />
              <Button
                size={"sm"}
                onClick={() => {
                  inputRef.current.click();
                }}
                colorScheme="blue"
              >
                Upload Profile Picture
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Flex>

      <ISDCODEMODAL
        isOpen={isOpen}
        onClose={onClose}
        setisd_code={setisd_code}
      />
    </Box>
  );
}