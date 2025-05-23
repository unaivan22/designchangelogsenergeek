import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, Clock, Loader, Pencil, Trash2, Users, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ModalImage from 'react-modal-image';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
  } from "@/components/ui/tooltip"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationEllipsis,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Textarea } from '@/components/ui/textarea';
import "quill/dist/quill.core.css";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import parse from 'html-react-parser';
import ScrollToTop from './ScrollToTop';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Helmet } from 'react-helmet';

const TasksWeb = () => {
    const { projectId } = useParams();
    const [project, setProject] = useState(null); // Store project details
    const [tasks, setTasks] = useState([]);
    const [form, setForm] = useState({ name: '', image: null });

    const [editTask, setEditTask] = useState(null); // To store the task being edited
    const [editedName, setEditedName] = useState('');
    const [editedImage, setEditedImage] = useState(null); // For storing the new image
    const [showAdd, setShowAdd] = useState(false);
    const [showTask, setShowTask] = useState(null); // To store the task being edited

    const [searchTerm, setSearchTerm] = useState('');
    const [statusCounts, setStatusCounts] = useState({
        completed: 0,
        ongoing: 0,
        pending: 0,
      });

    const [pelaporCounts, setPelaporCounts] = useState({
        filza: 0,
        drajat: 0,
      });

    const [eksekutorCounts, setEksekutorCounts] = useState({
        joko: 0,
        hanif: 0,
        ikke: 0,
        aria: 0,
        fatchur: 0,
        rifan: 0,
        evan: 0,
        rico: 0,
        fahmi: 0,
        algiant: 0,
        ardy: 0,
        bakhrul: 0,
        fenti: 0,
      });
  
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); // Pagination state
    const itemsPerPage = 10; // Number of items per page
    const [error, setError] = useState(false);


    // const apiUrl = '/crud-api/tasks.php';
    const apiUrl = 'https://designchangelogs.energeek.id//api/logs.php';

    useEffect(() => {
      const fetchData = async () => {
          try {
              // Fetch project details
              const projectRes = await axios.get(`${apiUrl}?project_id=${projectId}&fetch_project=true`);
              if (projectRes.data.length > 0) {
                  setProject(projectRes.data[0]); // Set the project name and other details
              }

              // Fetch tasks
              const tasksRes = await axios.get(`${apiUrl}?project_id=${projectId}`);
              const sortedTasks = tasksRes.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
              setTasks(sortedTasks);
          } catch (error) {
              console.error('Error fetching data:', error);
          }
      };

      fetchData();
  }, [projectId]);
  
    
    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Set loading to true when the upload starts
      setLoading(true);
  
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('project_id', projectId);
      if (form.image) {
          formData.append('image', form.image);
      }

      if (!form.name || form.name.trim() === "" || form.name === "<p><br></p>") {
        setError(true);
        setLoading(false);
        return;
      }
      setError(false);
  
      axios.post(apiUrl, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
          .then((res) => {
              // Add the new task to the list
              setTasks([...tasks, { id: res.data.id, name: form.name, status: 'pending', image: form.image ? URL.createObjectURL(form.image) : null }]);
              
              // Clear the form fields
              setForm({ name: '', image: null });
  
              // Reload the page to reflect the changes
              window.location.reload();
          })
          .catch((error) => {
              console.error("Error uploading the data:", error);
          })
          .finally(() => {
              // Set loading to false after the upload is done
              setLoading(false);
          });
  };
  

    const handleStatusChange = (id, status) => {
        axios
            .put(apiUrl, { id, status })
            .then(() => {
                setTasks((prevTasks) =>
                    prevTasks.map((task) =>
                        task.id === id ? { ...task, status } : task
                    )
                );
            })
            .catch((error) => {
                console.error("Failed to update status:", error);
                alert("Failed to update status. Please try again.");
            });
    };
    
    const handlePelaporChange = async (id, pelapor) => {
      try {
          await axios.put(apiUrl, { id, pelapor });
          
          // Update the local tasks state
          setTasks((prevTasks) =>
              prevTasks.map((task) =>
                  task.id === id ? { ...task, pelapor } : task
              )
          );
      } catch (error) {
          console.error("Failed to update pelapor:", error);
          alert("Failed to update pelapor. Please try again.");
      }
  };  

  const handleEksekutorChange = async (id, eksekutor) => {
    try {
        await axios.put(apiUrl, { id, eksekutor });
        
        // Update the local tasks state
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === id ? { ...task, eksekutor } : task
            )
        );
    } catch (error) {
        console.error("Failed to update eksekutor:", error);
        alert("Failed to update eksekutor. Please try again.");
    }
};  

    const handleDelete = (id) => {
        // Show a confirmation alert before proceeding with the delete action
        const isConfirmed = window.confirm('Yakin ingin hapus log ini?');
    
        if (isConfirmed) {
            // Proceed with the delete request if confirmed
            axios.delete(apiUrl, { data: { id, project_id: projectId } }).then(() => {
                setTasks(tasks.filter((task) => task.id !== id));
            }).catch((error) => {
                console.error('Error deleting task:', error);
            });
        }
    };

    // Handle opening the modal for editing a task
  const handleEdit = (task) => {
    setEditTask(task);
    setEditedName(task.name);
  };

  const handleDetail = (task) => {
    setShowTask(task);
    setEditedName(task.name);
  };

  // Handle saving the edited task
  const handleSaveChanges = async () => {
    try {
      // Prepare the updated task data with only the id and edited name
      const updatedTask = {
        id: editTask.id,
        name: editedName,
      };
  
      // Make the PUT request to update the task
      const response = await axios.put(
        `/api/logs.php?project_id=${editTask.project_id}`,
        updatedTask
      );
  
      // Check if the update was successful
      if (response.status === 200) {
        // Refresh the page to reflect the changes
        window.location.reload();
      } else {
        console.error('Error updating task:', response.data);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  
  const handleAdd = () => {
    setShowAdd(true)
  };

  const handleCloseAdd = () => {
    setShowAdd(false)
  };

  const handleCloseEdit = () => {
    setEditTask(false)
  };

  const handleCloseDetail = () => {
    setShowTask(false)
  };

  const filteredTasks = tasks.filter(task =>
    task.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
  const paginatedTasks = filteredTasks.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
      if (page >= 1 && page <= totalPages) {
          setCurrentPage(page);
      }
  };

  const renderPagination = () => {
          const pages = [];
          if (totalPages <= 3) {
            for (let i = 1; i <= totalPages; i++) {
              pages.push(
                <PaginationItem key={i}>
                  <PaginationLink
                    // href="#"
                    onClick={() => handlePageChange(i)}
                    isActive={i === currentPage}
                  >
                    {i}
                  </PaginationLink>
                </PaginationItem>
              );
            }
          } else {
            const rangeStart = Math.max(2, currentPage - 1);
            const rangeEnd = Math.min(totalPages - 1, currentPage + 1);
      
            pages.push(
              <PaginationItem key={1}>
                <PaginationLink
                  // href="#"
                  onClick={() => handlePageChange(1)}
                  isActive={currentPage === 1}
                >
                  1
                </PaginationLink>
              </PaginationItem>
            );
      
            if (rangeStart > 2) {
              pages.push(<PaginationEllipsis key="start-ellipsis" />);
            }
      
            for (let i = rangeStart; i <= rangeEnd; i++) {
              pages.push(
                <PaginationItem key={i}>
                  <PaginationLink
                    // href="#"
                    onClick={() => handlePageChange(i)}
                    isActive={i === currentPage}
                  >
                    {i}
                  </PaginationLink>
                </PaginationItem>
              );
            }
      
            if (rangeEnd < totalPages - 1) {
              pages.push(<PaginationEllipsis key="end-ellipsis" />);
            }
      
            pages.push(
              <PaginationItem key={totalPages}>
                <PaginationLink
                  // href="#"
                  onClick={() => handlePageChange(totalPages)}
                  isActive={currentPage === totalPages}
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            );
          }
          return pages;
        };

    useEffect(() => {
        // Count tasks based on status
        const counts = { completed: 0, ongoing: 0, pending: 0 };
        tasks.forEach(task => {
          if (task.status === 'completed') {
            counts.completed += 1;
          } else if (task.status === 'ongoing') {
            counts.ongoing += 1;
          } else if (task.status === 'pending') {
            counts.pending += 1;
          }
        });
        setStatusCounts(counts);
      }, [tasks]);
    
      // Calculate total number of tasks
      const totalTasks = tasks.length;
      const completedPercentage = totalTasks ? (statusCounts.completed / totalTasks) * 100 : 0;
      const ongoingPercentage = totalTasks ? (statusCounts.ongoing / totalTasks) * 100 : 0;
      const pendingPercentage = totalTasks ? (statusCounts.pending / totalTasks) * 100 : 0;


      useEffect(() => {
        // Count tasks based on status
        const counts = { filza: 0, drajat: 0};
        tasks.forEach(task => {
          if (task.pelapor === 'filza') {
            counts.filza += 1;
          } else if (task.pelapor === 'drajat') {
            counts.drajat += 1;
          }
        });
        setPelaporCounts(counts);
      }, [tasks]);
    
      // Calculate total number of tasks
      const totalPelaporTasks = tasks.length;
      const filzaPelaporPercentage = totalPelaporTasks ? (pelaporCounts.filza / totalPelaporTasks) * 100 : 0;
      const drajatPelaporPercentage = totalPelaporTasks ? (pelaporCounts.drajat / totalPelaporTasks) * 100 : 0;

      useEffect(() => {
        // Count tasks based on status
        const counts = { joko: 0, hanif: 0, ikke: 0, aria: 0, fatchur: 0, rifan: 0, evan: 0, rico: 0, fahmi: 0, algiant: 0, ardy: 0, bakhrul: 0, fenti: 0,};
        tasks.forEach(task => {
          if (task.eksekutor === 'joko') {
            counts.joko += 1;
          } else if (task.eksekutor === 'hanif') {
            counts.hanif += 1;
          } else if (task.eksekutor === 'ikke') {
            counts.ikke += 1;
          } else if (task.eksekutor === 'aria') {
            counts.aria += 1;
          } else if (task.eksekutor === 'fatchur') {
            counts.fatchur += 1;
          } else if (task.eksekutor === 'rifan') {
            counts.rifan += 1;
          } else if (task.eksekutor === 'evan') {
            counts.evan += 1;
          } else if (task.eksekutor === 'rico') {
            counts.rico += 1;
          } else if (task.eksekutor === 'fahmi') {
            counts.fahmi += 1;
          } else if (task.eksekutor === 'algiant') {
            counts.algiant += 1;
          } else if (task.eksekutor === 'ardy') {
            counts.ardy += 1;
          } else if (task.eksekutor === 'bakhrul') {
            counts.bakhrul += 1;
          } else if (task.eksekutor === 'fenti') {
            counts.fenti += 1;
          }
        });
        setEksekutorCounts(counts);
      }, [tasks]);

      // Calculate total number of tasks
      const totalEksekutorTasks = tasks.length;
      const jokoEksekutorPercentage = totalEksekutorTasks ? (eksekutorCounts.joko / totalEksekutorTasks) * 100 : 0;
      const hanifEksekutorPercentage = totalEksekutorTasks ? (eksekutorCounts.hanif / totalEksekutorTasks) * 100 : 0;
      const ikkeEksekutorPercentage = totalEksekutorTasks ? (eksekutorCounts.ikke / totalEksekutorTasks) * 100 : 0;
      const ariaEksekutorPercentage = totalEksekutorTasks ? (eksekutorCounts.aria / totalEksekutorTasks) * 100 : 0;
      const fatchurEksekutorPercentage = totalEksekutorTasks ? (eksekutorCounts.fatchur / totalEksekutorTasks) * 100 : 0;
      const rifanEksekutorPercentage = totalEksekutorTasks ? (eksekutorCounts.rifan / totalEksekutorTasks) * 100 : 0;
      const evanEksekutorPercentage = totalEksekutorTasks ? (eksekutorCounts.evan / totalEksekutorTasks) * 100 : 0;
      const ricoEksekutorPercentage = totalEksekutorTasks ? (eksekutorCounts.rico / totalEksekutorTasks) * 100 : 0;
      const fahmiEksekutorPercentage = totalEksekutorTasks ? (eksekutorCounts.fahmi / totalEksekutorTasks) * 100 : 0;
      const algiantEksekutorPercentage = totalEksekutorTasks ? (eksekutorCounts.algiant / totalEksekutorTasks) * 100 : 0;
      const ardyEksekutorPercentage = totalEksekutorTasks ? (eksekutorCounts.ardy / totalEksekutorTasks) * 100 : 0;
      const bakhrulEksekutorPercentage = totalEksekutorTasks ? (eksekutorCounts.bakhrul / totalEksekutorTasks) * 100 : 0;
      const fentiEksekutorPercentage = totalEksekutorTasks ? (eksekutorCounts.fenti / totalEksekutorTasks) * 100 : 0;
    
      const formatDate = (dateString) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const date = new Date(dateString);
        
        const day = date.getDate();
        const month = months[date.getMonth()];  // Get month name in Indonesian
        const year = date.getFullYear();
        const time = date.toLocaleTimeString('en-GB'); // Use en-GB for 24-hour format
    
        return `${day} ${month} ${year} (${time})`;
    };

    const HtmlRenderer = ({ html }) => {
      // Ensure `html` is a string
      const safeHtml = typeof html === 'string' ? html : '';
    
      const parsedHtml = parse(safeHtml, {
        replace: (domNode) => {
          if (domNode.type === 'text') {
            // Remove leading and trailing whitespaces
            return domNode.data.trim();
          }
        },
      });
    
      return <>{parsedHtml}</>;
    };
    

    const fullToolbarOptions = [
      [{ 'header': '1'}, { 'header': '2'}],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      // [{ 'script': 'sub'}, { 'script': 'super' }],
      // [{ 'indent': '-1'}, { 'indent': '+1' }],
      // [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote', 'link', 'image'],
      ['clean']
    ];

    return (
        <div>
          <Helmet>
            <title>{project ? project.name : '...'} - Energeek Design Changelogs </title>
          </Helmet>
          <ScrollToTop />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to='/' className='fixed top-12 left-12'><Button variant='outline' size='icon'> <ArrowLeft /></Button></Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Daftar project</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="container min-h-screen py-12">
              <h1 className="text-2xl font-bold my-4">Design Logs {project ? project.name : '...'}</h1>
              {/* <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-4 pb-8 mb-8 border-b items-start">
                  <div className='flex w-full items-start '>
                    <p className='text-sm mb-1 w-[300px]'>Changelogs</p>
                    <div className='flex flex-col gap-2 w-full'>
                      <ReactQuill
                        theme="snow"
                        value={form.name}
                        onChange={(value) => setForm({ ...form, name: value })} // Directly use the value
                        modules={{ toolbar: fullToolbarOptions }}
                        // className="quill-editor w-full h-[220px] rounded"
                        className={`quill-editor w-full rounded min-h-[10rem] ${error ? "border-red-500" : ""}`}
                        required
                        disabled={loading}
                      />
                      {error && <p className="text-red-500 text-sm w-full">Nama Task is required.</p>}
                    </div>
                  </div>
                  <div className='flex w-full items-start'>
                    <p className='text-sm mb-1 w-[300px] invisible'>Nama Task</p>
                    {error && <p className="text-red-500 text-sm w-full">Nama Task is required.</p>}
                  </div>
                  <div className='flex w-full items-center'>
                      <p className='text-sm mb-1 w-[300px]'>Upload Gambar <span className='opacity-50'>*opsional</span></p>
                      <Input
                          className="p-2 border rounded-lg w-full"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
                          disabled={loading}
                      />
                  </div>
                  <div className='flex w-full items-center'>
                      <p className='text-sm mb-1 w-[300px] invisible'>Aksi</p>
                      <div className='w-full'>
                        <Button className="rounded-lg" disabled={loading}> {loading && <Loader className="animate-spin mr-2 h-4 w-4" /> } Tambah</Button>
                      </div>
                  </div>
              </form> */}
              <div className='flex flex-col md:flex-row w-full gap-x-4 items-start'>
                  <div className='flex gap-x-2 w-[100%]'>
                    {/* <Link to='/'><Button variant='outline'> <ArrowLeft className='w-4 h-4 mr-2' /> Back</Button></Link> */}
                    <Input
                        type="search"
                        placeholder="Cari logs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border rounded mb-4 rounded-lg max-w-full md:max-w-[300px]"
                    />
                  </div>
                  <div className='flex flex-col w-full mr-4'>
                    <div className='flex gap-4'>
                      <div className='my-2 w-full w-full'>
                          <div className='flex gap-[2px]'>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                <div
                                className='bg-green-500 rounded h-4 transition-all duration-100 ease-linear'
                                style={{ width: `${completedPercentage}%` }}
                                ></div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Completed {completedPercentage}%</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                <div
                                className='bg-purple-500 rounded h-4 transition-all duration-100 ease-linear'
                                style={{ width: `${ongoingPercentage}%` }}
                                ></div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Ongoing {ongoingPercentage}%</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                <div
                                className='bg-stone-500 rounded h-4 transition-all duration-100 ease-linear'
                                style={{ width: `${pendingPercentage}%` }}
                                ></div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Pending {pendingPercentage}%</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className='flex gap-x-2 my-2'>
                              <div className='flex items-center gap-1'>
                              <div className='h-2 w-2 rounded-full bg-green-500'></div>
                              <p className='text-xs font-light opacity-100'>Complete</p>
                              </div>
                              <div className='flex items-center gap-1'>
                              <div className='h-2 w-2 rounded-full bg-purple-500'></div>
                              <p className='text-xs font-light opacity-100'>On Going</p>
                              </div>
                              <div className='flex items-center gap-1'>
                              <div className='h-2 w-2 rounded-full bg-stone-300'></div>
                              <p className='text-xs font-light opacity-400'>Pending</p>
                              </div>
                          </div>
                      </div>
                      <div className='my-2 w-full md:w-[40%]'>
                          <div className='flex gap-[2px]'>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                <div
                                className='bg-yellow-500 rounded h-4 transition-all duration-100 ease-linear'
                                style={{ width: `${filzaPelaporPercentage}%` }}
                                ></div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>filza {filzaPelaporPercentage}%</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                <div
                                className='bg-indigo-500 rounded h-4 transition-all duration-100 ease-linear'
                                style={{ width: `${drajatPelaporPercentage}%` }}
                                ></div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Drajat {drajatPelaporPercentage}%</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <div className='flex gap-x-2 my-2'>
                              <div className='flex items-center gap-1'>
                              <div className='h-2 w-2 rounded-full bg-yellow-500'></div>
                              <p className='text-xs font-light opacity-100'>filza</p>
                              </div>
                              <div className='flex items-center gap-1'>
                              <div className='h-2 w-2 rounded-full bg-indigo-500'></div>
                              <p className='text-xs font-light opacity-100'>Drajat</p>
                              </div>
                          </div>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleAdd}>Tambah</Button>
              </div>
              <div className='mt-2 mb-4 w-[100%] p-0'>
                  <div className='flex gap-[1px] w-full'>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <div
                        className='bg-yellow-500 h-4 rounded transition-all duration-100 ease-linear'
                        style={{ width: `${jokoEksekutorPercentage}%` }}
                        ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Joko {jokoEksekutorPercentage}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <div
                        className='bg-indigo-500 h-4 rounded transition-all duration-100 ease-linear'
                        style={{ width: `${hanifEksekutorPercentage}%` }}
                        ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Hanif {hanifEksekutorPercentage}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <div
                        className='bg-rose-500 h-4 rounded transition-all duration-100 ease-linear'
                        style={{ width: `${ikkeEksekutorPercentage}%` }}
                        ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ikke {ikkeEksekutorPercentage}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <div
                        className='bg-lime-500 h-4 rounded transition-all duration-100 ease-linear'
                        style={{ width: `${ariaEksekutorPercentage}%` }}
                        ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Aria {ariaEksekutorPercentage}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <div
                        className='bg-orange-500 h-4 rounded transition-all duration-100 ease-linear'
                        style={{ width: `${fatchurEksekutorPercentage}%` }}
                        ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Fatchur {fatchurEksekutorPercentage}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <div
                        className='bg-teal-500 h-4 rounded transition-all duration-100 ease-linear'
                        style={{ width: `${rifanEksekutorPercentage}%` }}
                        ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Rifan {rifanEksekutorPercentage}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <div
                        className='bg-violet-500 h-4 rounded transition-all duration-100 ease-linear'
                        style={{ width: `${evanEksekutorPercentage}%` }}
                        ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Evan {evanEksekutorPercentage}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <div
                        className='bg-fuchsia-500 h-4 rounded transition-all duration-100 ease-linear'
                        style={{ width: `${ricoEksekutorPercentage}%` }}
                        ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Rico {ricoEksekutorPercentage}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <div
                        className='bg-sky-500 h-4 rounded transition-all duration-100 ease-linear'
                        style={{ width: `${fahmiEksekutorPercentage}%` }}
                        ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Fahmi {fahmiEksekutorPercentage}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <div
                        className='bg-gray-500 h-4 rounded transition-all duration-100 ease-linear'
                        style={{ width: `${algiantEksekutorPercentage}%` }}
                        ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Algiant {algiantEksekutorPercentage}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <div
                        className='bg-stone-400 h-4 rounded transition-all duration-100 ease-linear'
                        style={{ width: `${ardyEksekutorPercentage}%` }}
                        ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ardy {ardyEksekutorPercentage}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <div
                        className='bg-emerald-400 h-4 rounded transition-all duration-100 ease-linear'
                        style={{ width: `${bakhrulEksekutorPercentage}%` }}
                        ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Bakhrul {bakhrulEksekutorPercentage}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <div
                        className='bg-pink-500 h-4 rounded transition-all duration-100 ease-linear'
                        style={{ width: `${fentiEksekutorPercentage}%` }}
                        ></div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Fenti {fentiEksekutorPercentage}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className='flex gap-x-2 my-2'>
                      <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-yellow-500'></div>
                        <p className='text-xs font-light opacity-100'>Joko</p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-indigo-500'></div>
                        <p className='text-xs font-light opacity-100'>Hanif</p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-rose-500'></div>
                        <p className='text-xs font-light opacity-100'>Ikke</p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-lime-500'></div>
                        <p className='text-xs font-light opacity-100'>Aria</p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-orange-500'></div>
                        <p className='text-xs font-light opacity-100'>Fatchur</p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-teal-500'></div>
                        <p className='text-xs font-light opacity-100'>Rifan</p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-violet-500'></div>
                        <p className='text-xs font-light opacity-100'>Evan</p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-fuchsia-500'></div>
                        <p className='text-xs font-light opacity-100'>Rico</p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-sky-500'></div>
                        <p className='text-xs font-light opacity-100'>Fahmi</p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-gray-500'></div>
                        <p className='text-xs font-light opacity-100'>Algiant</p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-stone-400'></div>
                        <p className='text-xs font-light opacity-100'>Ardy</p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-emerald-400'></div>
                        <p className='text-xs font-light opacity-100'>Bakhrul</p>
                      </div>
                      <div className='flex items-center gap-1'>
                        <div className='h-2 w-2 rounded-full bg-pink-500'></div>
                        <p className='text-xs font-light opacity-100'>Fenti</p>
                      </div>
                  </div>
              </div>
              <div className='rounded-md border mb-6'>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead className="text-center w-[50px]">*</TableHead>
                        <TableHead className="w-full">Logs</TableHead>
                        <TableHead className="text-center w-[200px]">Pelapor</TableHead>
                        <TableHead className="text-center w-[200px]">Eksekutor</TableHead>
                        <TableHead className="text-center w-[200px]">Status</TableHead>
                        <TableHead className="text-center w-[200px]">Aksi</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {paginatedTasks.map((task) => (
                        <TableRow key={task.id}>
                            <TableCell>
                                <div
                                    className={`w-3 h-3 rounded-full ${
                                        task.status === 'completed' ? 'bg-green-500' :
                                        task.status === 'ongoing' ? 'bg-purple-500' : 'bg-stone-400'
                                    }`}>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium ">
                                <div className='flex flex-col'>
                                  <div className='flex gap-3 items-center'>
                                    {/* <div>
                                    {task.image && (
                                        <ModalImage
                                            small={`https://designtest.energeek.id/crud-api/uploads/${task.image}`}
                                            large={`https://designtest.energeek.id/crud-api/uploads/${task.image}`}
                                            className="my-2 w-[50px] h-[50px] object-cover rounded-lg"
                                        />
                                    )}
                                    </div> */}
                                    <div className='flex flex-col gap-2 w-[300px] md:w-[90%]'>
                                      {/* <p className='line-clamp-[1] font-medium opacity-70'>{task.name}</p> */}
                                      <p className='line-clamp-[1] font-medium opacity-70 text-ellipsis table-detail'><HtmlRenderer html={task.name} /></p>
                                      <p className='font-light text-xs opacity-70 flex items-center gap-1'> 
                                        <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <Clock className='w-4 h-4 opacity-80' />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Tanggal dibuat</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        {formatDate(task.created_at)}</p>
                                    </div>
                                  </div>
                                    
                                </div>
                            </TableCell>
                            <TableCell>
                              <select
                                    value={task.pelapor}
                                    onChange={(e) => handlePelaporChange(task.id, e.target.value)}
                                    className="p-2 bg-transparent rounded dark:bg-black"
                                >
                                    <option value="filza">filza</option>
                                    <option value="drajat">Drajat</option>
                                </select>
                            </TableCell>
                            <TableCell>
                              <select
                                    value={task.eksekutor}
                                    onChange={(e) => handleEksekutorChange(task.id, e.target.value)}
                                    className="p-2 bg-transparent rounded dark:bg-black"
                                >
                                    <option disabled selected>Pilih</option>
                                    <option value="joko">Joko</option>
                                    <option value="hanif">Hanif</option>
                                    <option value="ikke">Ikke</option>
                                    <option value="aria">Aria</option>
                                    <option value="fatchur">Fatchur</option>
                                    <option value="rifan">Rifan</option>
                                    <option value="evan">Evan</option>
                                    <option value="rico">Rico</option>
                                    <option value="fahmi">Fahmi</option>
                                    <option value="algiant">Algiant</option>
                                    <option value="ardy">Ardy</option>
                                    <option value="bakhrul">Bakhrul</option>
                                    <option value="fenti">fenti</option>
                                </select>
                            </TableCell>
                            <TableCell>
                              <select
                                    value={task.status}
                                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                    className="p-2 bg-transparent rounded dark:bg-black"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="ongoing">On Going</option>
                                </select>
                            </TableCell>
                            <TableCell className="space-x-2 flex text-right w-full py-6">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="outline">Opsi</Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="w-40">
                                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                      <DropdownMenuItem onClick={() => handleDetail(task)}>
                                        <ArrowUpRight />
                                        <span>Detail</span>
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleEdit(task)}>
                                        <Pencil />
                                        <span>Edit</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleDelete(task.id)} className='bg-rose-50 hover:bg-rose-100 dark:bg-black text-rose-500 hover:text-rose-500'>
                                      <Trash2 />
                                      <span>Hapus</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                                
                            </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
              </div>
              <p className='text-sm font-light opacity-70 text-center mb-4'>List of {project ? project.name : '...'} design logs.</p>

              {/* Pagination */}
              <Pagination>
                <PaginationContent>
                    <PaginationItem>
                    <Button
                        variant='outline'
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                    >
                        First
                    </Button>
                    </PaginationItem>
                    <PaginationItem>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() =>
                        handlePageChange(currentPage > 1 ? currentPage - 1 : 1)
                        }
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft />
                    </Button>
                    </PaginationItem>
                    {renderPagination()}
                    <PaginationItem>
                    <Button
                        variant='outline'
                        size='icon'
                        onClick={() =>
                        handlePageChange(
                            currentPage < totalPages ? currentPage + 1 : totalPages
                        )
                        }
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight />
                    </Button>
                    </PaginationItem>
                    <PaginationItem>
                    <Button
                        variant='outline'
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        Last
                    </Button>
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
          </div>

          {showAdd && (
            <div className='fixed bg-white dark:bg-black w-screen h-screen top-0 left-0' id='home'>
              <div className='flex flex-col items-center justify-center h-[100vh] md:px-[25vw]'>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-4 pb-8 mb-8 items-start">
                    <div className='flex flex-col gap-3 w-full items-start '>
                      <p className='text-xl mb-1 font-semibold'>Tambah Changelogs</p>
                      <div className='flex flex-col gap-2 w-full'>
                        <ReactQuill
                          theme="snow"
                          value={form.name}
                          onChange={(value) => setForm({ ...form, name: value })} // Directly use the value
                          modules={{ toolbar: fullToolbarOptions }}
                          className={`quill-editor w-full rounded ${error ? "border-red-500" : ""}`}
                          required
                          disabled={loading}
                        />
                        {error && <p className="text-red-500 text-sm w-full">Nama Task is required.</p>}
                      </div>
                    </div>
                    <div className='flex w-full items-center'>
                      <Button className="rounded-lg" disabled={loading}> {loading && <Loader className="animate-spin mr-2 h-4 w-4" /> } Tambah</Button>
                    </div>
                </form>
                <X className='h-6 w-6 fixed top-12 right-12 dark:text-white cursor-pointer' onClick={handleCloseAdd} />
              </div>
            </div>
          )}

          {editTask && (
            <div open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)} className='fixed bg-white dark:bg-black w-screen h-screen top-0 left-0' id='home'>
              <div className='flex flex-col items-center justify-center h-[100vh] md:px-[20vw]'>
                <div className='flex flex-col gap-3'>
                  <p className='text-xl mb-1 font-semibold'>Edit Changelogs</p>
                  <ReactQuill
                      theme="snow"
                      value={editedName} // Bind the current value
                      onChange={(value) => setEditedName(value)} // Update state directly with the new value
                      placeholder="Task name"
                      modules={{ toolbar: fullToolbarOptions }}
                      className="quill-editor"
                    />
                  <Button className='w-fit' onClick={handleSaveChanges}>Simpan</Button>
                </div>
                <X className='h-6 w-6 fixed top-12 right-12 dark:text-white cursor-pointer' onClick={handleCloseEdit} />
              </div>
            </div>
          )}

          {showTask && (
            <div open={!!showTask} onOpenChange={(open) => !open && setShowTask(null)} className='fixed bg-white dark:bg-black w-screen h-screen top-0 left-0' id='home'>
              <div className='flex flex-col h-[100vh] md:px-[25vw]'>
                <div className='flex flex-col gap-3 h-screen overflow-y-scroll py-12 log-detail'>
                  {/* <p className='text-xl mb-1 font-semibold'>Edit Changelogs</p> */}
                  <HtmlRenderer html={showTask.name} className='w-full' />
                </div>
                <X className='h-6 w-6 fixed top-12 right-12 dark:text-white cursor-pointer' onClick={handleCloseDetail} />
              </div>
            </div>
          )}
        </div>
    );
};

export default TasksWeb;