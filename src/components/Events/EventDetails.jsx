import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import Header from "../Header.jsx";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteEvent, fetchEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { useState } from "react";
import Modal from "../UI/Modal.jsx";

export default function EventDetails() {
  const [isDeleting, setIsDeleting] = useState(false);
  const params = useParams();
  const navigate = useNavigate();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["events", params.id],
    queryFn: ({ signal }) => fetchEvent({ signal, id: params.id }),
  });

  const {
    mutate,
    isPending: isPendingDeleting,
    isError: isErrorDeleting,
    error: errorDeleting,
  } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });
      navigate("/events");
    },
  });

  function handleStartDeleting() {
    setIsDeleting(true);
  }
  function handleStopDeleting() {
    setIsDeleting(false);
  }

  function handleDelete() {
    mutate({ id: params.id });
  }

  let content;

  if (isPending) {
    content = (
      <div className="center" id="event-details-content">
        <p>Fetching event details...</p>
      </div>
    );
  }

  if (isError) {
    content = (
      <div className="center" id="event-details-content">
        <ErrorBlock
          title="Failed to load event details"
          message={
            error.info?.message ||
            "Failed to fetch event detail, please try again later!!"
          }
        />
        ;
      </div>
    );
  }

  if (data) {
    content = (
      <>
        {isDeleting && (
          <Modal onClose={handleStopDeleting}>
            <h2>Are you sure?</h2>
            <p>Do you really sure to delete this event?</p>
            <div className="form-actions">
              {isPendingDeleting && <p>Deleting, please wait!...</p>}
              {!isPendingDeleting && (
                <>
                  <button onClick={handleStopDeleting} className="button-text">
                    Cancel
                  </button>
                  <button onClick={handleDelete} className="button">
                    Delete
                  </button>
                </>
              )}
            </div>
            {isErrorDeleting && (
              <ErrorBlock
                title="Failed to delete the event"
                message={
                  deleteError.info?.message ||
                  "Failed to delete the event, please try again later"
                }
              />
            )}
          </Modal>
        )}
        <header>
          <h1>{data.title}</h1>
          <nav>
            <button onClick={handleStartDeleting}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://localhost:3000/${data.image}`} alt={data.title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{data.location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {data.date} @ {data.time}
              </time>
            </div>
            <p id="event-details-description">{data.description}</p>
          </div>
        </div>
      </>
    );
  }
  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
